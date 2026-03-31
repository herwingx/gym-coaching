"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/** Unique violation or equivalent — row already present for this admin; onboarding puede continuar */
function isBenignGymSettingsInsertError(
  err: { code?: string; message?: string } | null,
): boolean {
  if (!err) return false;
  if (err.code === "23505") return true;
  const msg = (err.message ?? "").toLowerCase();
  return (
    msg.includes("duplicate key") ||
    msg.includes("unique constraint") ||
    msg.includes("already exists")
  );
}

export async function validateAdminSetupCode(
  code: string,
): Promise<{ valid: boolean; error?: string }> {
  const setupCode = process.env.ADMIN_SETUP_CODE;
  if (!setupCode) {
    return {
      valid: false,
      error: "Configuración incompleta. Contacta al soporte.",
    };
  }
  if (code.trim() !== setupCode.trim()) {
    return { valid: false, error: "Código de activación incorrecto" };
  }
  return { valid: true };
}

export async function createAdminAccount(formData: FormData) {
  const supabase = await createClient();

  const setupCode = formData.get("setup_code") as string;
  const gymName = (formData.get("gym_name") as string)?.trim();
  const coachName = (formData.get("coach_name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  // Validar codigo en servidor (nunca exponer en cliente)
  const envCode = process.env.ADMIN_SETUP_CODE;
  if (!envCode || setupCode?.trim() !== envCode.trim()) {
    return { success: false, error: "Código de activación incorrecto" };
  }

  if (!coachName || coachName.length < 2) {
    return {
      success: false,
      error: "Tu nombre debe tener al menos 2 caracteres",
    };
  }

  if (!email || !password) {
    return { success: false, error: "Email y contraseña son requeridos" };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: "La contraseña debe tener al menos 8 caracteres",
    };
  }

  // Verificar que no exista admin
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  if ((count || 0) > 0) {
    return { success: false, error: "Ya existe una cuenta de administrador" };
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "admin",
        full_name: coachName,
      },
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { success: false, error: "Este email ya esta registrado" };
    }
    return { success: false, error: error.message };
  }

  if (data.user?.identities?.length === 0) {
    // Email ya existe: intentar convertir la cuenta existente en admin
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
    if (signInError) {
      return {
        success: false,
        error: "Este email ya esta registrado. Contraseña incorrecta.",
      };
    }
    const existingUserId = signInData.user?.id;
    if (!existingUserId) {
      return { success: false, error: "Error al verificar la cuenta" };
    }

    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const admin = createAdminClient();

      const { error: profileError } = await admin
        .from("profiles")
        .update({
          role: "admin",
          full_name: coachName,
          onboarding_completed: false,
        })
        .eq("id", existingUserId);

      if (profileError) {
        return { success: false, error: "Error al actualizar el perfil" };
      }

      const displayName =
        gymName && gymName.trim().length >= 2 ? gymName.trim() : coachName;
      const { error: gymInsertError } = await admin
        .from("gym_settings")
        .insert({
          admin_id: existingUserId,
          gym_name: displayName,
          setup_completed: false,
        });
      if (gymInsertError && !isBenignGymSettingsInsertError(gymInsertError)) {
        console.error(
          "[admin-setup] gym_settings insert (cuenta existente):",
          gymInsertError.message,
        );
        // No bloqueamos: el admin puede completar datos en onboarding
      }
    } catch {
      return {
        success: false,
        error: "Error de configuración. Verifica SUPABASE_SERVICE_ROLE_KEY.",
      };
    }

    redirect("/admin/onboarding");
  }

  if (!data.user) {
    return { success: false, error: "Error al crear la cuenta" };
  }

  // Actualizar perfil como admin, onboarding pendiente
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    role: "admin",
    full_name: coachName,
    onboarding_completed: false,
  });

  if (profileError) {
    return { success: false, error: "Error al configurar el perfil" };
  }

  // Crear gym_settings (business_name / marca - opcional)
  const displayName =
    gymName && gymName.trim().length >= 2 ? gymName.trim() : coachName;
  const { error: gymError } = await supabase.from("gym_settings").insert({
    admin_id: data.user.id,
    gym_name: displayName,
    setup_completed: false,
  });

  if (gymError && !isBenignGymSettingsInsertError(gymError)) {
    console.error(
      "[admin-setup] gym_settings insert (cuenta nueva):",
      gymError.message,
    );
    // No bloqueamos confirmación por email: el admin puede configurarlo en onboarding
  }

  if (data.session) {
    redirect("/admin/onboarding");
  }

  return {
    success: true,
    message: "Revisa tu email para confirmar tu cuenta. Luego inicia sesion.",
    needsEmailConfirmation: true,
  };
}
