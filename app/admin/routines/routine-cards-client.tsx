"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AdminCardWithActions,
  AdminCardHeaderWithActions,
  type AdminCardMenuSection,
} from "@/components/admin/admin-card-with-actions";
import { Eye, Edit2, Trash2 } from "lucide-react";
import { deleteRoutine } from "@/app/actions/routine-builder";
import { getGoalLabel } from "@/lib/constants";
import { toast } from "sonner";

export type RoutineCardItem = {
  id: string;
  name: string;
  description: string | null;
  goal: string | null;
  level: string | null;
  duration_weeks: number | null;
  days_per_week: number | null;
  routine_days?: { id: string; is_rest_day?: boolean | null }[];
};

interface RoutineCardsClientProps {
  routines: RoutineCardItem[];
}

export function RoutineCardsClient({
  routines: initialRoutines,
}: RoutineCardsClientProps) {
  const router = useRouter();
  const [routines, setRoutines] = useState(initialRoutines);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await deleteRoutine(deleteId);
      if (result.success) {
        setRoutines(routines.filter((r) => r.id !== deleteId));
        toast.success("Rutina eliminada correctamente");
        setDeleteId(null);
        router.refresh();
      } else {
        toast.error(result.error || "No se pudo eliminar la rutina");
      }
    } catch {
      toast.error("No se pudo eliminar la rutina. Intenta de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {routines.map((routine) => {
          const configuredDays = routine.routine_days ?? [];
          const hasConfiguredDays = configuredDays.length > 0;
          const trainingDaysFromConfig = configuredDays.filter(
            (day) => !day.is_rest_day,
          ).length;
          const daysPerWeek = hasConfiguredDays
            ? trainingDaysFromConfig
            : (routine.days_per_week ?? 0);
          const durationWeeks = routine.duration_weeks ?? 0;
          const intensity = Math.min(100, Math.round((daysPerWeek / 7) * 100));
          const volumeLabel =
            daysPerWeek >= 6
              ? "Alta frecuencia"
              : daysPerWeek >= 4
                ? "Frecuencia media"
                : "Frecuencia baja";

          const menuSections: AdminCardMenuSection[] = [
            {
              items: [
                {
                  label: "Ver",
                  icon: <Eye className="mr-2 size-4" />,
                  href: `/admin/routines/${routine.id}`,
                },
                {
                  label: "Editar",
                  icon: <Edit2 className="mr-2 size-4" />,
                  href: `/admin/routines/${routine.id}/edit`,
                },
              ],
            },
            {
              separatorBefore: true,
              items: [
                {
                  label: "Eliminar",
                  icon: <Trash2 className="mr-2 size-4" />,
                  onClick: () => {
                    setDeleteId(routine.id);
                    setDeleteName(routine.name);
                  },
                  variant: "destructive" as const,
                },
              ],
            },
          ];

          return (
            <AdminCardWithActions
              key={routine.id}
              menuSections={menuSections}
              cardClassName="border-muted/70"
            >
              <AdminCardHeaderWithActions menuSections={menuSections}>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold leading-none">
                    {routine.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{volumeLabel}</Badge>
                    <Badge variant="outline">
                      {routine.goal
                        ? getGoalLabel(routine.goal)
                        : "Objetivo libre"}
                    </Badge>
                  </div>
                </div>
              </AdminCardHeaderWithActions>
              <CardContent className="p-4 pt-3">
                <div className="flex flex-col gap-4">
                  {routine.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {routine.description}
                    </p>
                  )}
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nivel:</span>
                      <span className="capitalize">
                        {routine.level || "No especificado"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duración:</span>
                      <span>{durationWeeks || "-"} semanas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Días/semana:
                      </span>
                      <span>{daysPerWeek}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 rounded-lg border border-dashed p-3">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                      <span>Carga semanal</span>
                      <span>{intensity}%</span>
                    </div>
                    <div className="overflow-hidden rounded-full border bg-muted">
                      <div
                        className="h-2 bg-primary/80"
                        style={{ width: `${Math.max(intensity, 8)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Carga estimada por frecuencia para planificación semanal.
                    </p>
                  </div>
                </div>
              </CardContent>
            </AdminCardWithActions>
          );
        })}
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rutina?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{deleteName}&quot; y todos sus días y
              ejercicios. Esta acción no se puede deshacer. Si la rutina está
              asignada a clientes, la asignación también se eliminará.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default RoutineCardsClient;
