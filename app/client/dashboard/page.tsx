import { getAuthData } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateLevel, type RoutineDay } from "@/lib/types";
import { CLIENT_DASHBOARD_SESSIONS_CAP } from "@/lib/performance-limits";
import { getNextRoutineDay } from "@/lib/next-routine-day";
import { ClientDashboardContent } from "./client-dashboard-content";

export default async function ClientDashboard() {
  const { user, profile } = await getAuthData();

  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  // Batch 1: client, userAchievements (independent, only need user.id)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [clientRes, userAchievementsRes] = await Promise.all([
    supabase.from("clients").select("*").eq("user_id", user.id).single(),
    supabase
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", user.id),
  ]);

  const client = clientRes.data;
  const userAchievements = userAchievementsRes.data || [];

  // Batch 2: workoutSessions, prsThisMonth, client_routines (need client.id)
  let workoutSessions:
    | {
        total_volume_kg?: number | null;
        status?: string;
        started_at?: string;
        routine_day_id?: string | null;
      }[]
    | null = null;
  let prsThisMonth = 0;
  let routineId =
    (client as { assigned_routine_id?: string } | null)?.assigned_routine_id ??
    null;
  let latestCompletedRoutineDayId: string | null = null;
  let clientCurrentWeek = 1;

  if (client?.id) {
    const [sessionsRes, prsRes, crRes, lastCompletedDayRes] = await Promise.all(
      [
        supabase
          .from("workout_sessions")
          .select("*")
          .eq("client_id", client.id)
          .order("created_at", { ascending: false })
          .limit(CLIENT_DASHBOARD_SESSIONS_CAP),
        supabase
          .from("pr_events")
          .select("*", { count: "exact", head: true })
          .eq("client_id", client.id)
          .gte("achieved_at", startOfMonth.toISOString()),
        supabase
          .from("client_routines")
          .select("routine_id, current_week")
          .eq("client_id", client.id)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle(),
        supabase
          .from("workout_sessions")
          .select("routine_day_id")
          .eq("client_id", client.id)
          .eq("status", "completed")
          .not("routine_day_id", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ],
    );
    workoutSessions = sessionsRes.data;
    prsThisMonth = prsRes.count ?? 0;
    if (!routineId) routineId = crRes.data?.routine_id ?? null;
    latestCompletedRoutineDayId =
      lastCompletedDayRes.data?.routine_day_id ?? null;

    // Store current_week to check for completion
    clientCurrentWeek = crRes.data?.current_week ?? 1;
  }

  // Batch 3: routine with full details (need routineId)
  let assignedRoutine = null;
  let isRoutineCompleted = false;

  if (routineId) {
    const { data } = await supabase
      .from("routines")
      .select(
        `
        *,
        routine_days (
          *,
          routine_exercises (
            *,
            exercises (*)
          )
        )
      `,
      )
      .eq("id", routineId)
      .single();
    assignedRoutine = data;

    if (assignedRoutine && assignedRoutine.duration_weeks) {
      isRoutineCompleted = clientCurrentWeek > assignedRoutine.duration_weeks;
    }
  }

  // Calculate level info
  const levelInfo = calculateLevel(profile?.xp_points || 0);

  // Calculate total volume from sessions
  const totalVolume =
    workoutSessions?.reduce((sum, s) => sum + (s.total_volume_kg || 0), 0) || 0;

  // Completed sessions only (for chart and count)
  const completedSessions = (workoutSessions || []).filter(
    (s: any) => s.status === "completed" && s.started_at,
  );
  const totalWorkoutsCompleted = completedSessions.length;
  const chartDataMap = new Map<string, number>();
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    chartDataMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const s of completedSessions) {
    const dateStr = (s.started_at || "").slice(0, 10);
    if (chartDataMap.has(dateStr)) {
      chartDataMap.set(dateStr, (chartDataMap.get(dateStr) || 0) + 1);
    }
  }
  const chartData = Array.from(chartDataMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, sessions]) => ({ date, sessions }));

  const lastCompletedWithDayId =
    latestCompletedRoutineDayId ??
    (workoutSessions || []).find(
      (s) => s.status === "completed" && s.routine_day_id,
    )?.routine_day_id ??
    null;
  const nextWorkoutRoutineDay = getNextRoutineDay(
    (assignedRoutine?.routine_days ?? []) as RoutineDay[],
    lastCompletedWithDayId,
  );

  return (
    <ClientDashboardContent
      profile={profile}
      levelInfo={levelInfo}
      totalWorkouts={totalWorkoutsCompleted}
      totalVolume={totalVolume}
      prsThisMonth={prsThisMonth || 0}
      assignedRoutine={assignedRoutine}
      nextWorkoutRoutineDay={nextWorkoutRoutineDay}
      isRoutineCompleted={isRoutineCompleted}
      userAchievements={userAchievements || []}
      chartData={chartData}
    />
  );
}
