"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getUserProfile } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export async function createNewRoutine(formData: FormData) {
  const user = await getAuthUser();
  const profile = await getUserProfile();

  if (!user || profile?.role !== "admin") {
    throw new Error("No autorizado");
  }

  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const goal = formData.get("goal") as string;
  const level = formData.get("level") as string;
  const daysPerWeek = parseInt(formData.get("daysPerWeek") as string) || null;
  const durationWeeks =
    parseInt(formData.get("durationWeeks") as string) || null;

  const { data, error } = await supabase
    .from("routines")
    .insert([
      {
        id: crypto.randomUUID(),
        coach_id: user.id,
        name,
        description: description || null,
        goal: goal || null,
        level: level || null,
        days_per_week: daysPerWeek,
        duration_weeks: durationWeeks,
      },
    ])
    .select();

  if (error) {
    console.error("Error creating routine:", error);
    throw new Error(error.message);
  }

  redirect(`/admin/routines/${data[0].id}`);
}
