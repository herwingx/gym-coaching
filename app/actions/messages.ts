"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

/** Misma lógica que /client/messages para saber con qué coach puede hablar el asesorado. */
async function resolveCoachIdForClientUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const { data: clientWithCoach } = await supabase
    .from("clients")
    .select("coach_id")
    .eq("user_id", userId)
    .maybeSingle();

  let coachId: string | null = clientWithCoach?.coach_id ?? null;

  if (!coachId) {
    const { data: inv } = await supabase
      .from("invitation_codes")
      .select("created_by")
      .eq("used_by_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    coachId = inv?.created_by ?? null;
  }

  if (!coachId) {
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .order("created_at", { ascending: true, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    coachId = adminProfile?.id ?? null;
  }

  return coachId;
}

async function assertCanSendMessage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  fromUserId: string,
  role: string | undefined,
  toUserId: string,
) {
  if (role === "admin") {
    const { data } = await supabase
      .from("clients")
      .select("id")
      .eq("coach_id", fromUserId)
      .eq("user_id", toUserId)
      .maybeSingle();
    if (!data) {
      throw new Error("No puedes enviar mensajes a este usuario.");
    }
    return;
  }

  if (role === "client") {
    const allowedCoachId = await resolveCoachIdForClientUser(
      supabase,
      fromUserId,
    );
    if (!allowedCoachId || allowedCoachId !== toUserId) {
      throw new Error("No puedes enviar mensajes a este usuario.");
    }
    return;
  }

  throw new Error("No autorizado para enviar mensajes.");
}

export async function sendMessage(toUserId: string, content: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("No autenticado");

  const text = content.trim();
  if (!text) throw new Error("El mensaje no puede estar vacío.");

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  await assertCanSendMessage(supabase, user.id, role, toUserId);

  const { error } = await supabase.from("messages").insert({
    from_user_id: user.id,
    to_user_id: toUserId,
    content: text,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/messages");
  revalidatePath("/client/messages");
}

export async function markMessagesAsRead(fromUserId: string) {
  const user = await getAuthUser();
  if (!user) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("to_user_id", user.id)
    .eq("from_user_id", fromUserId);

  if (error) {
    console.error("[markMessagesAsRead]", error.message);
    return;
  }

  revalidatePath("/admin/messages");
  revalidatePath("/client/messages");
}
