import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, Pencil, Sparkles } from "lucide-react";
import { DeleteRoutineButton } from "./delete-routine-button";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { RoutineDayCards } from "@/components/routines/routine-day-cards";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

type RoutineDayRow = { is_rest_day: boolean };

interface Props {
  params: Promise<{ routineId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { routineId } = await params;
  const supabase = await createClient();
  const { data: routine } = await supabase
    .from("routines")
    .select("name")
    .eq("id", routineId)
    .single();
  return {
    title: routine?.name ? `${routine.name} | RU Coach` : "Rutina | RU Coach",
  };
}

export default async function RoutineDetailsPage({ params }: Props) {
  const user = await getAuthUser();
  const { routineId } = await params;

  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await createClient();
  const { data: routine } = await supabase
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

  if (!routine) {
    redirect("/admin/routines");
  }
  const configuredDays = routine.routine_days ?? [];
  const hasConfiguredDays = configuredDays.length > 0;
  const trainingDaysPerWeek = hasConfiguredDays
    ? (configuredDays as RoutineDayRow[]).filter((day) => !day.is_rest_day)
        .length
    : (routine.days_per_week ?? 0);

  return (
    <div className="bg-background">
      <AdminPageHeader
        title={routine.name}
        backHref="/admin/routines"
        backLabel="Volver a rutinas"
        description={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{routine.level || "Nivel libre"}</Badge>
            <Badge variant="outline">
              {routine.goal || "Objetivo general"}
            </Badge>
          </div>
        }
        actions={
          <>
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/admin/routines/${routineId}/edit`}>
                <Pencil className="mr-2 size-4" />
                Editar
              </Link>
            </Button>
            <DeleteRoutineButton
              routineId={routineId}
              routineName={routine.name}
            />
          </>
        }
      />

      <main className="container py-6 sm:py-8">
        <div className="grid gap-6">
          {/* Routine Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4" />
                Información de la rutina
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="font-medium">
                  {routine.description || "Sin descripción"}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nivel</p>
                  <p className="font-medium capitalize">
                    {routine.level || "No especificado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duración</p>
                  <p className="font-medium">
                    {routine.duration_weeks
                      ? `${routine.duration_weeks} semanas`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Días/semana</p>
                  <p className="font-medium">{trainingDaysPerWeek}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              <h2 className="text-base font-semibold">Plan semanal</h2>
            </div>
            <RoutineDayCards days={routine.routine_days || []} />
          </section>
        </div>
      </main>
    </div>
  );
}
