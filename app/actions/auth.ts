"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function syncProfileRole(
  userId: string,
  role: "admin" | "client",
) {
  try {
    const admin = createAdminClient();
    await admin.from("profiles").update({ role }).eq("id", userId);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function signOut() {
  const supabase = await createClient();
  try {
    await supabase.auth.signOut();
  } catch {
    // Si falla (ej. cookies), redirigir igual para cerrar la sesión en el cliente
  }
  redirect("/auth/login");
}
