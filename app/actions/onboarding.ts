"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FitnessGoal, ExperienceLevel } from "@/lib/types";

/** Mapea FitnessGoal (onboarding) a clients.goal (DB) */
const GOAL_MAP: Record<FitnessGoal, string> = {
  lose_weight: "weight_loss",
  gain_muscle: "muscle_gain",
  maintain: "maintenance",
  strength: "toning",
  endurance: "endurance",
};

/** Mapea clients.goal (DB) a FitnessGoal (profiles) */
const GOAL_REVERSE: Record<string, FitnessGoal> = {
  weight_loss: "lose_weight",
  muscle_gain: "gain_muscle",
  maintenance: "maintain",
  toning: "strength",
  endurance: "endurance",
};

interface OnboardingData {
  userId: string;
  fullName: string;
  username: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  height?: number;
  initialWeight?: number;
  fitnessGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  notificationsEnabled?: boolean;
}

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient();

  // Verificar que el usuario autenticado sea el que actualiza su propio perfil
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== data.userId) {
    return { success: false, error: "No autorizado" };
  }

  const admin = createAdminClient();

  // Check if username is available
  const { data: existingUser } = await admin
    .from("profiles")
    .select("id")
    .eq("username", data.username)
    .neq("id", data.userId)
    .single();

  if (existingUser) {
    return { success: false, error: "Este nombre de usuario ya está en uso" };
  }

  // Update profile (admin bypassa RLS, evita recursión)
  const profileUpdate: Record<string, unknown> = {
    full_name: data.fullName,
    username: data.username,
    phone: data.phone || null,
    birth_date: data.birthDate || null,
    gender: data.gender || null,
    fitness_goal: data.fitnessGoal,
    experience_level: data.experienceLevel,
    onboarding_completed: true,
    xp_points: 0,
    level: 1,
    streak_days: 0,
  };
  if (typeof data.notificationsEnabled === "boolean") {
    profileUpdate.notifications_enabled = data.notificationsEnabled;
  }
  const { error: profileError } = await admin
    .from("profiles")
    .update(profileUpdate)
    .eq("id", data.userId);

  if (profileError) {
    console.error("Profile update error:", profileError);
    return { success: false, error: "Error al actualizar el perfil" };
  }

  // Enviar email de bienvenida (en background, no bloqueante)
  if (user.email) {
    const { sendWelcomeEmail } = await import("@/lib/email");
    sendWelcomeEmail({
      to: user.email,
      clientName: data.fullName,
    }).catch((err) => console.error("Error enviando email bienvenida:", err));
  }

  const clientGoal = GOAL_MAP[data.fitnessGoal] ?? "maintenance";

  // Buscar cliente ya vinculado a este usuario
  let { data: existingClient } = await admin
    .from("clients")
    .select("id")
    .eq("user_id", data.userId)
    .maybeSingle();

  if (!existingClient && user.email) {
    // Fallback: cliente pre-creado por admin con mismo email pero sin user_id
    const { data: clientByEmail } = await admin
      .from("clients")
      .select("id, coach_id, goal, experience_level, full_name")
      .eq("email", user.email)
      .is("user_id", null)
      .limit(1)
      .maybeSingle();

    if (clientByEmail) {
      const preserveAdminData = clientByEmail.goal && clientByEmail.experience_level;
      const updatePayload: Record<string, unknown> = {
        user_id: data.userId,
        full_name: data.fullName,
        phone: data.phone || null,
        birth_date: data.birthDate || null,
        gender: data.gender || null,
        height: data.height || null,
        initial_weight: data.initialWeight || null,
        current_weight: data.initialWeight || null,
        onboarding_completed: true,
      };
      if (!preserveAdminData) {
        updatePayload.goal = clientGoal;
        updatePayload.experience_level = data.experienceLevel;
      }

      const { error: linkError } = await admin
        .from("clients")
        .update(updatePayload)
        .eq("id", clientByEmail.id);

      if (linkError) {
        console.error(
          "[completeOnboarding] Error vinculando cliente por email:",
          linkError,
        );
      } else {
        existingClient = { id: clientByEmail.id };
      }
    }
  }

  if (!existingClient) {
    const { data: profile } = await admin
      .from("profiles")
      .select("invited_by")
      .eq("id", data.userId)
      .single();

    let coachId = profile?.invited_by as string | null;
    if (!coachId) {
      const { data: firstAdmin } = await admin
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .limit(1)
        .maybeSingle();
      coachId = firstAdmin?.id ?? null;
    }

    if (coachId) {
      const { error: clientError } = await admin.from("clients").insert({
        id: crypto.randomUUID(),
        user_id: data.userId,
        coach_id: coachId,
        full_name: data.fullName,
        phone: data.phone || null,
        email: user.email || "",
        birth_date: data.birthDate || null,
        gender: data.gender || null,
        height: data.height || null,
        initial_weight: data.initialWeight || null,
        current_weight: data.initialWeight || null,
        goal: clientGoal,
        experience_level: data.experienceLevel,
        status: "active",
        onboarding_completed: true,
      });

      if (clientError) {
        console.error("Client creation error:", clientError);
      }
    }
  }

  return { success: true };
}

/**
 * Si el cliente fue pre-creado por el admin con preferencias (goal, experience_level),
 * marca onboarding como completado sin exigir el flujo. Retorna true si se omitió.
 */
export async function trySkipOnboardingForPreCreatedClient(
  userId: string,
): Promise<{
  skipped: boolean;
  fitnessGoal?: FitnessGoal;
  experienceLevel?: ExperienceLevel;
  fullName?: string;
}> {
  const admin = createAdminClient();

  const { data: client } = await admin
    .from("clients")
    .select("id, full_name, goal, experience_level")
    .eq("user_id", userId)
    .maybeSingle();

  if (!client || !client.goal || !client.experience_level) {
    return { skipped: false };
  }

  const fitnessGoal = GOAL_REVERSE[client.goal] ?? "maintain";
  const experienceLevel = (client.experience_level ||
    "beginner") as ExperienceLevel;

  const slug = (client.full_name || "user")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  const username =
    (slug || "user") + "_" + Math.random().toString(36).slice(2, 6);

  const profileUpdate: Record<string, unknown> = {
    full_name: client.full_name || "Usuario",
    username,
    fitness_goal: fitnessGoal,
    experience_level: experienceLevel,
    onboarding_completed: true,
    xp_points: 0,
    level: 1,
    streak_days: 0,
  };

  const { error } = await admin
    .from("profiles")
    .update(profileUpdate)
    .eq("id", userId);

  if (error) {
    console.error("[trySkipOnboarding] Error:", error);
    return { skipped: false };
  }

  await admin
    .from("clients")
    .update({ onboarding_completed: true })
    .eq("id", client.id);

  return {
    skipped: true,
    fitnessGoal,
    experienceLevel,
    fullName: client.full_name || undefined,
  };
}
