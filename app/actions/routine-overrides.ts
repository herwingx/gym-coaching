"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ExerciseOverride {
  id: string;
  client_routine_id: string;
  original_routine_exercise_id: number;
  replacement_exercise_id: string;
  reason: string | null;
  changed_by: "client" | "coach";
  notified_coach: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET: overrides de un client_routine
// ─────────────────────────────────────────────────────────────────────────────
export async function getClientRoutineOverrides(
  clientRoutineId: string,
): Promise<ExerciseOverride[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("client_exercise_overrides")
    .select("*")
    .eq("client_routine_id", clientRoutineId)
    .order("created_at", { ascending: false });

  return (data ?? []) as ExerciseOverride[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE: cliente cambia un ejercicio
// ─────────────────────────────────────────────────────────────────────────────
export async function swapExerciseForClient(input: {
  clientRoutineId: string;
  originalRoutineExerciseId: number;
  replacementExerciseId: string;
  reason?: string;
}): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "No autenticado" };

  const supabase = await createClient();

  // Verificar que el cliente es dueño de esta client_routine
  const { data: cr } = await supabase
    .from("client_routines")
    .select("id, client_id, routine_id")
    .eq("id", input.clientRoutineId)
    .single();

  if (!cr) return { success: false, error: "Rutina no encontrada" };

  const { data: clientRow } = await supabase
    .from("clients")
    .select("id, user_id, coach_id")
    .eq("id", cr.client_id)
    .single();

  if (clientRow?.user_id !== user.id) {
    return { success: false, error: "No autorizado" };
  }

  // Obtener info de los ejercicios para el mensaje
  const { data: origEx } = await supabase
    .from("routine_exercises")
    .select("id, exercises(name, name_es), routine_day_id, routine_days(day_number, day_name)")
    .eq("id", input.originalRoutineExerciseId)
    .single();

  const { data: newEx } = await supabase
    .from("exercises")
    .select("id, name, name_es")
    .eq("id", input.replacementExerciseId)
    .single();

  // Upsert del override (UNIQUE por client_routine + original_exercise)
  const { error } = await supabase
    .from("client_exercise_overrides")
    .upsert(
      {
        client_routine_id: input.clientRoutineId,
        original_routine_exercise_id: input.originalRoutineExerciseId,
        replacement_exercise_id: input.replacementExerciseId,
        reason: input.reason ?? null,
        changed_by: "client",
        notified_coach: false,
      },
      { onConflict: "client_routine_id,original_routine_exercise_id" },
    );

  if (error) return { success: false, error: error.message };

  // Notificar al coach vía mensaje automático en el chat
  try {
    const origExData = origEx?.exercises as { name?: string; name_es?: string } | null;
    const rdData = origEx?.routine_days as { day_number?: number; day_name?: string } | null;

    const origName = origExData?.name_es || origExData?.name || "Ejercicio";
    const newName = (newEx as { name?: string; name_es?: string } | null)?.name_es 
      || (newEx as { name?: string; name_es?: string } | null)?.name 
      || "Ejercicio alternativo";
    const dayLabel = rdData?.day_name
      ? `Día ${rdData.day_number} (${rdData.day_name})`
      : `Día ${rdData?.day_number ?? "?"}`;

    const reasonText = input.reason ? ` Motivo: "${input.reason}".` : "";
    const messageContent = `📋 He cambiado **${origName}** por **${newName}** en ${dayLabel} de mi rutina.${reasonText} Por favor revisa si está bien.`;

    // Buscar el admin (coach) al que notificar
    if (clientRow?.coach_id) {
      await supabase.from("messages").insert({
        from_user_id: user.id,
        to_user_id: clientRow.coach_id,
        content: messageContent,
      });

      // Marcar como notificado
      await supabase
        .from("client_exercise_overrides")
        .update({ notified_coach: true })
        .eq("client_routine_id", input.clientRoutineId)
        .eq("original_routine_exercise_id", input.originalRoutineExerciseId);
    }
  } catch (notifyErr) {
    console.warn("No se pudo notificar al coach:", notifyErr);
    // No bloquear aunque la notificación falle
  }

  revalidatePath("/client/routines");
  revalidatePath("/client/workout");

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE: coach cambia un ejercicio para un cliente específico
// ─────────────────────────────────────────────────────────────────────────────
export async function swapExerciseByCoach(input: {
  clientRoutineId: string;
  originalRoutineExerciseId: number;
  replacementExerciseId: string;
  reason?: string;
}): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "No autenticado" };

  const supabase = await createClient();

  // Verificar que es admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Solo admins pueden hacer cambios de coach" };
  }

  const { error } = await supabase
    .from("client_exercise_overrides")
    .upsert(
      {
        client_routine_id: input.clientRoutineId,
        original_routine_exercise_id: input.originalRoutineExerciseId,
        replacement_exercise_id: input.replacementExerciseId,
        reason: input.reason ?? null,
        changed_by: "coach",
        notified_coach: true,
      },
      { onConflict: "client_routine_id,original_routine_exercise_id" },
    );

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/clients");
  revalidatePath("/client/routines");

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE: revertir un override (coach o cliente)
// ─────────────────────────────────────────────────────────────────────────────
export async function revertExerciseOverride(
  overrideId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "No autenticado" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("client_exercise_overrides")
    .delete()
    .eq("id", overrideId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/clients");
  revalidatePath("/client/routines");

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: aplicar overrides sobre una lista de ejercicios de rutina
// Usado por getNextWorkoutDay y la vista de rutinas del cliente
// ─────────────────────────────────────────────────────────────────────────────
export async function applyExerciseOverrides<
  T extends { id: number; exercises?: unknown },
>(
  clientRoutineId: string,
  routineExercises: T[],
  supabaseClient?: Awaited<ReturnType<typeof createClient>>,
): Promise<T[]> {
  const supabase = supabaseClient ?? (await createClient());

  const { data: overrides } = await supabase
    .from("client_exercise_overrides")
    .select(
      "original_routine_exercise_id, replacement_exercise_id, exercises!replacement_exercise_id(*)",
    )
    .eq("client_routine_id", clientRoutineId);

  if (!overrides?.length) return routineExercises;

  const overrideMap = new Map(
    overrides.map((o) => [
      o.original_routine_exercise_id,
      o.exercises,
    ]),
  );

  return routineExercises.map((ex) => {
    const replacement = overrideMap.get(ex.id);
    if (!replacement) return ex;
    return { ...ex, exercises: replacement };
  });
}
