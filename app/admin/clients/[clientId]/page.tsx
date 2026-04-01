import type { Metadata } from "next";
import { getAuthUser, getUserRole } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getBodyMeasurements,
  getExerciseLogsForSessions,
  getWorkoutSessions,
} from "@/lib/workouts";
import { getRoutineById } from "@/lib/routines";
import {
  ClientProfileHub,
  type ClientHubClient,
  type HubWorkoutSession,
} from "./client-profile-hub";
import type { Routine } from "@/lib/types";
import { AccessCodeBanner } from "./access-code-banner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

interface Props {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ accessCode?: string; emailSent?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clientId } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("full_name")
    .eq("id", clientId)
    .single();
  return {
    title: client?.full_name
      ? `${client.full_name} | RU Coach`
      : "Atleta | RU Coach",
  };
}

/** Medidas recientes suficientes para la ficha (evita traer miles de filas). */
const HUB_MEASUREMENTS_LIMIT = 150;

export default async function ClientProfilePage({
  params,
  searchParams,
}: Props) {
  const user = await getAuthUser();
  const role = await getUserRole();
  const { clientId } = await params;
  const { accessCode, emailSent } = await searchParams;

  if (!user) redirect("/auth/login");
  if (role !== "admin") redirect("/auth/login");

  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .eq("coach_id", user.id)
    .single();

  if (error || !client) redirect("/admin/clients");

  const planPromise =
    client.current_plan_id != null
      ? supabase
          .from("membership_plans")
          .select("name")
          .eq("id", client.current_plan_id)
          .single()
      : Promise.resolve({ data: null as { name: string } | null });

  const adminClient = createAdminClient();

  const profilePromise = client.user_id
    ? adminClient
        .from("profiles")
        .select(
          "role, streak_days, last_workout_at, xp_points, level, onboarding_completed",
        )
        .eq("id", client.user_id)
        .single()
    : Promise.resolve({ data: null });

  const [
    planRes,
    profileRes,
    workoutSessions,
    bodyMeasurements,
    photosRes,
    activeClientRoutineRes,
    prsRes,
  ] = await Promise.all([
    planPromise,
    profilePromise,
    getWorkoutSessions(clientId, 12),
    getBodyMeasurements(clientId, HUB_MEASUREMENTS_LIMIT),
    supabase
      .from("progress_photos")
      .select(
        "id, photo_url, view_type, weight_kg, taken_at, notes, created_at",
      )
      .eq("client_id", clientId)
      .order("taken_at", { ascending: false })
      .limit(30),
    supabase
      .from("client_routines")
      .select("routine_id")
      .eq("client_id", clientId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("personal_records")
      .select("exercise_id, exercise_name, weight_kg, reps, achieved_at")
      .eq("client_id", clientId)
      .order("achieved_at", { ascending: false }),
  ]);

  const personalRecords = prsRes.data ?? [];

  const sessionExerciseLogs = await getExerciseLogsForSessions(
    workoutSessions.map((s) => s.id),
  );

  const planName = planRes.data?.name ?? null;
  const profile = profileRes.data ?? null;
  const progressPhotos = photosRes.data ?? [];

  const routineIdFromClient =
    (client as { assigned_routine_id?: string | null }).assigned_routine_id ??
    activeClientRoutineRes.data?.routine_id ??
    null;
  const routine = routineIdFromClient
    ? await getRoutineById(routineIdFromClient)
    : null;

  const daysUntilExpiry = client.membership_end
    ? Math.ceil(
        (new Date(client.membership_end).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const clientWithExtras = {
    ...client,
    plan_name: planName,
    days_until_expiry: daysUntilExpiry,
  };

  return (
    <div className="min-h-dvh bg-background">
      <AdminPageHeader
        title={client.full_name}
        backHref="/admin/clients"
        backLabel="Volver a asesorados"
        description={`${planName ? `Plan de asesoría: ${planName}` : "Sin plan de asesoría"}${
          profile?.streak_days != null
            ? ` · ${profile.streak_days} días racha`
            : ""
        }`}
      />

      <main className="container flex flex-col gap-8 py-8">
        {accessCode && (
          <AccessCodeBanner
            code={accessCode}
            clientEmail={client.email}
            emailSent={emailSent === "1"}
            emailFailed={emailSent === "0"}
          />
        )}
        <ClientProfileHub
          client={clientWithExtras as ClientHubClient}
          profile={profile}
          routine={routine as Routine | null}
          workoutSessions={workoutSessions as HubWorkoutSession[]}
          sessionExerciseLogs={sessionExerciseLogs}
          bodyMeasurements={bodyMeasurements}
          progressPhotos={progressPhotos ?? []}
          personalRecords={personalRecords}
          clientId={clientId}
        />
      </main>
    </div>
  );
}
