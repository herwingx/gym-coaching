"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CircularProgress } from "@/components/ui/circular-progress";
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
  X,
  Play,
  Pause,
  SkipForward,
  Check,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Timer,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { calculate1RM } from "@/lib/types";
import type {
  RoutineDay,
  RoutineExercise,
  PersonalRecord,
  Exercise,
} from "@/lib/types";
import { ExerciseDetailDrawer } from "@/components/client/exercise-detail-drawer";
import { ExerciseMedia } from "@/components/client/exercise-media";
import { Badge } from "@/components/ui/badge";
import { completeWorkoutSession } from "@/app/actions/workout";
import {
  isPRBeatingBaseline,
  mergePRBaselines,
  suggestWeightForTargetReps,
} from "@/lib/progression";
import { ClientStackPageHeader } from "@/components/client/client-app-page-parts";
import { cn } from "@/lib/utils";
import { exerciseUsesExternalLoad } from "@/lib/exercise-tracking";
import { AchievementUnlockModal } from "@/components/client/achievement-unlock-modal";
import type { Achievement } from "@/lib/types";

function formatElapsed(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface WorkoutActiveSessionProps {
  clientId: string;
  routineDay: RoutineDay & {
    routine_exercises: (RoutineExercise & { exercises: any })[];
  };
  routineName: string;
  previousByExercise: Record<string, { weight_kg: number; reps: number }>;
  personalRecords: PersonalRecord[];
}

interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  isPR: boolean;
}

function workoutDraftStorageKey(routineDayId: string) {
  return `gym-workout-draft:${routineDayId}`;
}

interface WorkoutDraftV1 {
  v: 1;
  routineDayId: string;
  currentExerciseIndex: number;
  workoutNote: string;
  sets: Record<string, SetLog[]>;
  workoutStartTime: number;
}

export function WorkoutActiveSession({
  clientId,
  routineDay,
  routineName,
  previousByExercise,
  personalRecords,
}: WorkoutActiveSessionProps) {
  const router = useRouter();
  const exercises = routineDay.routine_exercises || [];
  const loadPolicyByExerciseId = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const re of exercises) {
      const ex = re.exercises;
      m.set(
        re.exercise_id,
        exerciseUsesExternalLoad(
          ex?.exercise_type,
          ex?.uses_external_load,
          ex?.equipment,
        ),
      );
    }
    return m;
  }, [exercises]);
  const draftKey = workoutDraftStorageKey(routineDay.id);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState<Map<string, SetLog[]>>(new Map());
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [totalRestTime, setTotalRestTime] = useState(90);
  const [workoutStartTime, setWorkoutStartTime] = useState(() => Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  const [workoutNote, setWorkoutNote] = useState("");
  const [jumpTargetIndex, setJumpTargetIndex] = useState<number | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  /** Tras comprobar sessionStorage: sin borrador → listo; con borrador → esperando diálogo recuperar/descartar */
  const [draftCheckpoint, setDraftCheckpoint] = useState<"pending" | "ready">(
    "pending",
  );
  const [restoreDraft, setRestoreDraft] = useState<WorkoutDraftV1 | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const restoreDismissRef = useRef<"apply" | "discard" | null>(null);

  const currentExercise = exercises[currentExerciseIndex];
  const currentSets = sets.get(currentExercise?.id?.toString()) || [];

  const isDirty = useMemo(() => {
    if (workoutNote.trim().length > 0) return true;
    if (currentExerciseIndex !== 0) return true;
    for (const list of sets.values()) {
      if (list.some((s) => s.completed)) return true;
    }
    return false;
  }, [workoutNote, currentExerciseIndex, sets]);

  const getSuggestedWeight = useCallback(
    (exerciseId: string, targetReps: number): number => {
      if (!loadPolicyByExerciseId.get(exerciseId)) return 0;
      const prev = previousByExercise[exerciseId];
      const pr = personalRecords.find((p) => p.exercise_id === exerciseId);

      return suggestWeightForTargetReps({
        estimated1RM: pr?.estimated_1rm,
        lastWeight: prev?.weight_kg,
        lastReps: prev?.reps,
        targetReps,
        incrementKg: 2.5,
        defaultWeightKg: 20,
      }).weight;
    },
    [previousByExercise, personalRecords, loadPolicyByExerciseId],
  );

  useEffect(() => {
    const t = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);
    return () => window.clearInterval(t);
  }, [workoutStartTime]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (!raw) {
        setDraftCheckpoint("ready");
        return;
      }
      const data = JSON.parse(raw) as WorkoutDraftV1;
      if (data.v !== 1 || data.routineDayId !== routineDay.id) {
        sessionStorage.removeItem(draftKey);
        setDraftCheckpoint("ready");
        return;
      }
      setRestoreDraft(data);
      setRestoreOpen(true);
    } catch {
      sessionStorage.removeItem(draftKey);
      setDraftCheckpoint("ready");
    }
  }, [draftKey, routineDay.id]);

  useEffect(() => {
    if (draftCheckpoint !== "ready") return;
    if (!isDirty) {
      sessionStorage.removeItem(draftKey);
      return;
    }
    const payload: WorkoutDraftV1 = {
      v: 1,
      routineDayId: routineDay.id,
      currentExerciseIndex,
      workoutNote,
      sets: Object.fromEntries(sets),
      workoutStartTime,
    };
    const id = window.setTimeout(() => {
      try {
        sessionStorage.setItem(draftKey, JSON.stringify(payload));
      } catch {
        // quota / private mode
      }
    }, 450);
    return () => window.clearTimeout(id);
  }, [
    draftCheckpoint,
    draftKey,
    isDirty,
    routineDay.id,
    currentExerciseIndex,
    workoutNote,
    sets,
    workoutStartTime,
  ]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!currentExercise) return;
    const id = currentExercise.id.toString();
    setSets((prev) => {
      if (prev.has(id)) return prev;
      const targetReps = parseInt(currentExercise.reps || "10", 10);
      const initialSets: SetLog[] = Array.from(
        { length: currentExercise.sets },
        (_, i) => ({
          setNumber: i + 1,
          weight: getSuggestedWeight(currentExercise.exercise_id, targetReps),
          reps: targetReps,
          completed: false,
          isPR: false,
        }),
      );
      return new Map(prev).set(id, initialSets);
    });
  }, [currentExercise, getSuggestedWeight]);

  useEffect(() => {
    if (!currentExercise) return;
    if (loadPolicyByExerciseId.get(currentExercise.exercise_id)) return;
    const id = currentExercise.id.toString();
    setSets((prev) => {
      const list = prev.get(id);
      if (!list?.length) return prev;
      if (!list.some((s) => s.weight !== 0)) return prev;
      return new Map(prev).set(
        id,
        list.map((s) => ({ ...s, weight: 0, isPR: false })),
      );
    });
  }, [currentExercise, loadPolicyByExerciseId]);

  useEffect(() => {
    const el = thumbRefs.current[currentExerciseIndex];
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [currentExerciseIndex]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isResting && restTime > 0 && !isPaused) {
      interval = setInterval(() => {
        setRestTime((t) => t - 1);
      }, 1000);
    } else if (restTime === 0 && isResting) {
      setIsResting(false);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      toast.success("Descanso terminado. ¡Siguiente serie!");
    }
    return () => clearInterval(interval);
  }, [isResting, restTime, isPaused]);

  const checkForPR = (
    exerciseId: string,
    weight: number,
    reps: number,
    sameExerciseSets: SetLog[],
    setIndex: number,
  ): boolean => {
    if (!loadPolicyByExerciseId.get(exerciseId)) return false;
    const currentPR = personalRecords.find(
      (pr) => pr.exercise_id === exerciseId,
    );
    const dbBaseline =
      currentPR && currentPR.weight_kg > 0 && currentPR.reps > 0
        ? {
            weight: currentPR.weight_kg,
            reps: currentPR.reps,
            estimated_1rm:
              currentPR.estimated_1rm && currentPR.estimated_1rm > 0
                ? currentPR.estimated_1rm
                : calculate1RM(currentPR.weight_kg, currentPR.reps),
          }
        : null;

    let baseline = dbBaseline;
    for (let i = 0; i < sameExerciseSets.length; i++) {
      if (i === setIndex) continue;
      const s = sameExerciseSets[i];
      if (!s.completed) continue;
      const cand = {
        weight: s.weight,
        reps: s.reps,
        estimated_1rm: calculate1RM(s.weight, s.reps),
      };
      baseline = mergePRBaselines(baseline, cand);
    }

    return isPRBeatingBaseline(weight, reps, baseline);
  };

  const completeSet = (setIndex: number) => {
    if (!currentExercise) return;
    const id = currentExercise.id.toString();

    let prToast: { weight: number; reps: number } | null = null;
    let shouldRest = false;
    const restSec = currentExercise.rest_seconds || 90;

    setSets((prev) => {
      const list = prev.get(id);
      if (!list) return prev;
      const updatedSets = [...list];
      const set = updatedSets[setIndex];
      const isPR = checkForPR(
        currentExercise.exercise_id,
        set.weight,
        set.reps,
        updatedSets,
        setIndex,
      );
      set.completed = true;
      set.isPR = isPR;
      if (isPR && loadPolicyByExerciseId.get(currentExercise.exercise_id)) {
        prToast = { weight: set.weight, reps: set.reps };
      }
      shouldRest = setIndex < updatedSets.length - 1;
      return new Map(prev).set(id, updatedSets);
    });

    queueMicrotask(() => {
      if (prToast) {
        toast.success("¡Nuevo récord personal!", {
          description: `${prToast.weight} kg × ${prToast.reps} repeticiones`,
          icon: <Trophy className="h-5 w-5 text-primary" />,
        });
      }
      if (shouldRest) {
        setRestTime(restSec);
        setTotalRestTime(restSec);
        setIsResting(true);
      }
    });
  };

  const updateSetValue = (
    setIndex: number,
    field: "weight" | "reps",
    delta: number,
  ) => {
    if (!currentExercise) return;
    const id = currentExercise.id.toString();
    setSets((prev) => {
      const list = prev.get(id);
      if (!list) return prev;
      const updatedSets = [...list];
      const set = updatedSets[setIndex];
      if (field === "weight") {
        set.weight = Math.max(0, set.weight + delta);
      } else {
        set.reps = Math.max(1, set.reps + delta);
      }
      return new Map(prev).set(id, updatedSets);
    });
  };

  const addSet = () => {
    if (!currentExercise) return;
    const id = currentExercise.id.toString();
    const targetReps = parseInt(currentExercise.reps || "10", 10);
    setSets((prev) => {
      const list = prev.get(id) || [];
      const last = list[list.length - 1];
      const nextSet: SetLog = {
        setNumber: list.length + 1,
        weight:
          last?.weight ??
          getSuggestedWeight(currentExercise.exercise_id, targetReps),
        reps: last?.reps ?? targetReps,
        completed: false,
        isPR: false,
      };
      return new Map(prev).set(id, [...list, nextSet]);
    });
  };

  /** Solo se pueden quitar series añadidas con «Añadir serie» (por encima del plan). */
  const removeSet = (setIndex: number) => {
    if (!currentExercise) return;
    const id = currentExercise.id.toString();
    const prescribed = Math.max(1, currentExercise.sets);
    setSets((prev) => {
      const list = prev.get(id);
      if (!list || list.length <= prescribed) return prev;
      if (setIndex < prescribed) return prev;
      const next = list
        .filter((_, i) => i !== setIndex)
        .map((s, i) => ({ ...s, setNumber: i + 1 }));
      return new Map(prev).set(id, next);
    });
  };

  const goToExercise = (index: number) => {
    setCurrentExerciseIndex(index);
    setIsResting(false);
    setJumpTargetIndex(null);
  };

  const requestGoToExercise = (index: number) => {
    if (index === currentExerciseIndex) return;
    const incomplete =
      currentSets.length > 0 && currentSets.some((s) => !s.completed);
    if (incomplete) {
      setJumpTargetIndex(index);
      return;
    }
    goToExercise(index);
  };

  const nextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      goToExercise(currentExerciseIndex + 1);
    }
  };

  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      goToExercise(currentExerciseIndex - 1);
    }
  };

  const finishWorkout = async () => {
    if (isFinishing) return;
    setIsFinishing(true);

    let totalVolume = 0;
    sets.forEach((exerciseSets) => {
      exerciseSets.forEach((set) => {
        if (set.completed) {
          totalVolume += set.weight * set.reps;
        }
      });
    });

    const duration = Math.max(
      1,
      Math.round((Date.now() - workoutStartTime) / 60000),
    );

    try {
      const allCompletedSets: {
        exerciseId: string;
        setNumber: number;
        weight: number;
        reps: number;
        isPR?: boolean;
      }[] = [];

      sets.forEach((exerciseSets, routineExerciseId) => {
        const exercise = exercises.find(
          (e) => e.id.toString() === routineExerciseId,
        );
        const exerciseId = exercise?.exercise_id;
        if (!exerciseId) return;

        exerciseSets.forEach((set) => {
          if (!set.completed) return;
          allCompletedSets.push({
            exerciseId,
            setNumber: set.setNumber,
            weight: set.weight,
            reps: set.reps,
            isPR: set.isPR,
          });
        });
      });

      if (allCompletedSets.length === 0) {
        toast.error("Marca al menos una serie completada antes de terminar");
        setIsFinishing(false);
        return;
      }

      const result = await completeWorkoutSession({
        clientId,
        routineDayId: routineDay.id,
        sets: allCompletedSets,
        durationMinutes: duration,
        notes: workoutNote.trim() || undefined,
      });

      if (!result.success) {
        toast.error("No se pudo guardar el entrenamiento", {
          description: result.error,
        });
        return;
      }

      try {
        sessionStorage.removeItem(draftKey);
      } catch {
        /* noop */
      }

      toast.success("¡Entrenamiento guardado!", {
        description: `${duration} min · ${Math.round(totalVolume)} kg volumen · ${result.stats?.prsCount ?? 0} PRs`,
      });

      if (
        result.stats?.newAchievements &&
        result.stats.newAchievements.length > 0
      ) {
        sessionStorage.setItem("last_session_id", result.sessionId);
        setNewlyUnlocked(result.stats.newAchievements as Achievement[]);
      } else {
        router.push(`/client/workout/summary?sessionId=${result.sessionId}`);
      }
    } catch (err) {
      toast.error("Error inesperado guardando el entrenamiento");
      console.error(err);
    } finally {
      setIsFinishing(false);
    }
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTime(0);
  };

  const applyWorkoutDraft = useCallback(() => {
    if (!restoreDraft) return;
    restoreDismissRef.current = "apply";
    setWorkoutStartTime(restoreDraft.workoutStartTime);
    setCurrentExerciseIndex(
      Math.min(
        Math.max(0, restoreDraft.currentExerciseIndex),
        Math.max(0, exercises.length - 1),
      ),
    );
    setWorkoutNote(restoreDraft.workoutNote);
    setSets(new Map(Object.entries(restoreDraft.sets)));
    setRestoreDraft(null);
    setRestoreOpen(false);
    setDraftCheckpoint("ready");
  }, [restoreDraft, exercises.length]);

  const discardWorkoutDraft = useCallback(() => {
    restoreDismissRef.current = "discard";
    try {
      sessionStorage.removeItem(draftKey);
    } catch {
      /* noop */
    }
    setRestoreDraft(null);
    setRestoreOpen(false);
    setDraftCheckpoint("ready");
  }, [draftKey]);

  const confirmLeaveWorkout = useCallback(() => {
    setLeaveOpen(false);
    router.push("/client/dashboard");
  }, [router]);

  const completedSetsCount = currentSets.filter((s) => s.completed).length;
  const allSetsCompleted =
    completedSetsCount === currentSets.length && currentSets.length > 0;

  const usesExternalLoad = currentExercise
    ? exerciseUsesExternalLoad(
        currentExercise.exercises?.exercise_type,
        currentExercise.exercises?.uses_external_load,
        currentExercise.exercises?.equipment,
      )
    : true;

  const previewLabel = (() => {
    if (!currentExercise) return "—";
    const prev = previousByExercise[currentExercise.exercise_id];
    if (!prev) return "—";
    if (usesExternalLoad) {
      return prev.weight_kg > 0 ? `${prev.weight_kg}×${prev.reps}` : "—";
    }
    return prev.reps > 0 ? `${prev.reps} rep.` : "—";
  })();

  const restSeconds = currentExercise?.rest_seconds || 90;

  return (
    <div
      id="main-content"
      role="main"
      className="flex min-h-dvh flex-col bg-background"
      tabIndex={-1}
    >
      <ClientStackPageHeader
        sticky
        title={routineDay.day_name ?? "Entrenamiento"}
        subtitle={routineName}
        backHref="/client/dashboard"
        backLabel="Salir del entreno"
        backIcon={<X className="size-4" aria-hidden />}
        onBackClick={() => {
          if (isDirty) setLeaveOpen(true);
          else router.push("/client/dashboard");
        }}
        actions={
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <div
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 text-sm font-semibold tabular-nums text-foreground"
              role="timer"
              aria-live="polite"
              aria-label={`Tiempo de sesión ${formatElapsed(elapsedSec)}`}
            >
              <Timer className="size-4 shrink-0 text-primary" aria-hidden />
              {formatElapsed(elapsedSec)}
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={finishWorkout}
              disabled={isFinishing}
              className="min-h-11 sm:min-h-10"
            >
              {isFinishing ? "Guardando…" : "Terminar"}
            </Button>
          </div>
        }
      />
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all motion-reduce:transition-none"
          style={{
            width: `${((currentExerciseIndex + 1) / Math.max(exercises.length, 1)) * 100}%`,
          }}
        />
      </div>

      <AlertDialog
        open={restoreOpen}
        onOpenChange={(open) => {
          if (open) return;
          const reason = restoreDismissRef.current;
          restoreDismissRef.current = null;
          if (reason === "apply" || reason === "discard") return;
          try {
            sessionStorage.removeItem(draftKey);
          } catch {
            /* noop */
          }
          setRestoreDraft(null);
          setDraftCheckpoint("ready");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Recuperar tu progreso?</AlertDialogTitle>
            <AlertDialogDescription>
              Había un entreno sin terminar guardado en este dispositivo. Puedes
              restaurar series, nota y tiempo o empezar de cero. Nada se envía
              al servidor hasta que pulses Terminar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" onClick={discardWorkoutDraft}>
              Empezar de cero
            </AlertDialogCancel>
            <AlertDialogAction type="button" onClick={applyWorkoutDraft}>
              Recuperar progreso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir del entreno?</AlertDialogTitle>
            <AlertDialogDescription>
              Si sales sin pulsar Terminar, la sesión no se guarda en el
              servidor. En este dispositivo guardamos un borrador por si vuelves
              a abrir el mismo día (puedes recuperarlo o borrarlo al entrar).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Seguir entrenando</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLeaveWorkout}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Salir sin terminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={jumpTargetIndex !== null}
        onOpenChange={(open) => !open && setJumpTargetIndex(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cambiar de ejercicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes series sin marcar en este ejercicio. Si cambias ahora,
              podrás volver después; los datos escritos se conservan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Seguir aquí</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                jumpTargetIndex !== null && goToExercise(jumpTargetIndex)
              }
            >
              Cambiar igualmente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isResting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-6 backdrop-blur">
          <p className="mb-4 text-sm text-muted-foreground">DESCANSO</p>
          <CircularProgress
            value={restTime}
            max={totalRestTime}
            size={200}
            strokeWidth={8}
          >
            <div className="text-center">
              <span className="text-5xl font-bold">{restTime}</span>
              <p className="text-sm text-muted-foreground">segundos</p>
            </div>
          </CircularProgress>
          <div className="mt-8 flex gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <Play className="h-5 w-5" />
              ) : (
                <Pause className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={skipRest}
              className="bg-primary text-primary-foreground"
            >
              <SkipForward className="mr-2 h-5 w-5" />
              Saltar
            </Button>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Siguiente: Serie {completedSetsCount + 1} de {currentSets.length}
          </p>
        </div>
      )}

      <main className="container mx-auto min-w-0 max-w-7xl flex-1 py-6">
        {currentExercise && (
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
            <div className="flex flex-col gap-4 lg:col-span-5">
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11 shrink-0"
                  onClick={prevExercise}
                  disabled={currentExerciseIndex === 0}
                  aria-label="Ejercicio anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Ejercicio {currentExerciseIndex + 1} de {exercises.length}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11 shrink-0"
                  onClick={nextExercise}
                  disabled={currentExerciseIndex === exercises.length - 1}
                  aria-label="Siguiente ejercicio"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <div
                ref={carouselRef}
                className="-mx-1 flex gap-3 overflow-x-auto px-1 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="tablist"
                aria-label="Ejercicios del día"
              >
                {exercises.map((re, idx) => {
                  const ex = re.exercises as Exercise | undefined;
                  const active = idx === currentExerciseIndex;
                  return (
                    <button
                      key={re.id}
                      type="button"
                      ref={(el) => {
                        thumbRefs.current[idx] = el;
                      }}
                      role="tab"
                      aria-selected={active}
                      aria-label={`${ex?.name ?? `Ejercicio ${idx + 1}`}${active ? ", actual" : ""}`}
                      onClick={() => requestGoToExercise(idx)}
                      className={cn(
                        // border-2 en lugar de ring+offset: overflow-x-auto recorta sombras fuera del layout
                        "flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border-2 p-1.5 transition-colors",
                        active
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-transparent opacity-80 hover:border-border/60 hover:opacity-100",
                      )}
                    >
                      <div className="size-14 shrink-0 overflow-hidden rounded-full border border-border/80 bg-muted sm:size-16">
                        <ExerciseMedia
                          src={ex?.gif_url || ex?.image_url}
                          alt=""
                          variant="thumb"
                          className="size-full rounded-full"
                          imgClassName="object-cover"
                        />
                      </div>
                      <span className="max-w-18 truncate text-[10px] font-medium text-muted-foreground">
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
                <button
                  type="button"
                  className="relative flex w-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => {
                    setSelectedExercise(currentExercise.exercises);
                    setDetailOpen(true);
                  }}
                >
                  <div className="relative aspect-4/3 w-full bg-muted/80 dark:bg-muted/50">
                    <ExerciseMedia
                      src={
                        currentExercise.exercises?.gif_url ||
                        currentExercise.exercises?.image_url
                      }
                      alt={currentExercise.exercises?.name ?? "Ejercicio"}
                      variant="fill"
                      className="absolute inset-0 size-full"
                      imgClassName="object-contain"
                    />
                  </div>
                </button>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 p-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="min-h-10 gap-2"
                    onClick={() => {
                      setSelectedExercise(currentExercise.exercises);
                      setDetailOpen(true);
                    }}
                  >
                    <PlayCircle className="size-4 text-primary" aria-hidden />
                    Ver técnica
                  </Button>
                  <Badge variant="outline" className="gap-1 tabular-nums">
                    <Timer className="size-3.5" aria-hidden />
                    {restSeconds}s descanso
                  </Badge>
                </div>
              </div>

              <Textarea
                value={workoutNote}
                onChange={(e) => setWorkoutNote(e.target.value)}
                placeholder="Nota del entreno (opcional). ¿Cómo te has sentido?"
                className="min-h-18 text-base md:text-sm"
                maxLength={2000}
                aria-label="Notas del entrenamiento"
              />
            </div>

            <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:col-span-7 lg:self-start lg:pt-1">
              <div>
                <h2 className="text-balance text-xl font-bold capitalize leading-tight sm:text-2xl">
                  {currentExercise.exercises?.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-primary">
                  Plan: {currentExercise.sets} series ×{" "}
                  {currentExercise.reps || "var."} reps
                </p>
                {!usesExternalLoad ? (
                  <p className="mt-2 text-xs leading-snug text-muted-foreground text-pretty">
                    Sin peso en barra/máquina: registra solo las repeticiones (o
                    el trabajo del plan). El volumen en kg no aplica.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <div
                  className={cn(
                    "hidden items-end gap-x-2 px-0.5 sm:grid",
                    usesExternalLoad
                      ? "grid-cols-[2.75rem_4rem_1fr_1fr_auto] lg:grid-cols-[2.75rem_4rem_1fr_1fr_3.5rem]"
                      : "grid-cols-[2.75rem_4rem_1fr_auto] lg:grid-cols-[2.75rem_4rem_1fr_3.5rem]",
                  )}
                  aria-hidden
                >
                  <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Serie
                  </span>
                  <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Previa
                  </span>
                  {usesExternalLoad ? (
                    <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Kg
                    </span>
                  ) : null}
                  <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Reps
                  </span>
                  <span className="sr-only">Acciones</span>
                </div>

                {currentSets.map((set, index) => {
                  const prescribedSets = Math.max(1, currentExercise.sets);
                  const canRemoveRow =
                    index >= prescribedSets &&
                    currentSets.length > prescribedSets;

                  return (
                    <Card
                      key={`${currentExercise.id}-${set.setNumber}-${index}`}
                      className={cn(
                        "transition-all",
                        set.completed &&
                          (set.isPR
                            ? "border-primary bg-primary/10"
                            : "border-success/50 bg-success/5"),
                      )}
                    >
                      <CardContent className="p-3 sm:p-3">
                        {/* Móvil: apilado, targets ≥44px, etiquetas alineadas con controles */}
                        <div className="flex flex-col gap-4 sm:hidden">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={cn(
                                  "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                                  set.completed
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground",
                                )}
                                aria-hidden
                              >
                                {set.completed ? (
                                  <Check className="h-5 w-5" aria-hidden />
                                ) : (
                                  set.setNumber
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Serie {set.setNumber} · Previa
                                </p>
                                <p className="text-base font-medium tabular-nums text-foreground">
                                  {previewLabel}
                                </p>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {canRemoveRow ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="size-11"
                                  onClick={() => removeSet(index)}
                                  aria-label={`Quitar serie extra ${set.setNumber}`}
                                >
                                  <Trash2 className="h-5 w-5" aria-hidden />
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                variant={set.completed ? "outline" : "default"}
                                size="icon"
                                className={cn(
                                  "size-11 shrink-0",
                                  !set.completed &&
                                    "bg-primary text-primary-foreground hover:bg-primary/90",
                                )}
                                onClick={() => completeSet(index)}
                                disabled={set.completed}
                                aria-label={`Marcar serie ${set.setNumber} hecha`}
                              >
                                <Check className="h-5 w-5" aria-hidden />
                              </Button>
                            </div>
                          </div>

                          {usesExternalLoad ? (
                            <div className="flex flex-col gap-2">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Peso (kg)
                              </span>
                              <div className="flex min-w-0 items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="size-11 shrink-0"
                                  onClick={() =>
                                    updateSetValue(index, "weight", -2.5)
                                  }
                                  disabled={set.completed}
                                  aria-label="Menos peso"
                                >
                                  <Minus className="h-5 w-5" aria-hidden />
                                </Button>
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  value={set.weight}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setSets((prev) => {
                                      const id = currentExercise.id.toString();
                                      const list = prev.get(id);
                                      if (!list) return prev;
                                      const copy = [...list];
                                      copy[index] = {
                                        ...copy[index],
                                        weight: val,
                                      };
                                      return new Map(prev).set(id, copy);
                                    });
                                  }}
                                  className="min-h-11 min-w-0 flex-1 px-2 text-center text-base font-bold tabular-nums"
                                  disabled={set.completed}
                                  aria-label={`Peso serie ${set.setNumber}`}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="size-11 shrink-0"
                                  onClick={() =>
                                    updateSetValue(index, "weight", 2.5)
                                  }
                                  disabled={set.completed}
                                  aria-label="Más peso"
                                >
                                  <Plus className="h-5 w-5" aria-hidden />
                                </Button>
                              </div>
                            </div>
                          ) : null}

                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Repeticiones
                            </span>
                            <div className="flex min-w-0 items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-11 shrink-0"
                                onClick={() =>
                                  updateSetValue(index, "reps", -1)
                                }
                                disabled={set.completed}
                                aria-label="Menos repeticiones"
                              >
                                <Minus className="h-5 w-5" aria-hidden />
                              </Button>
                              <Input
                                type="number"
                                inputMode="numeric"
                                value={set.reps}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 1;
                                  setSets((prev) => {
                                    const id = currentExercise.id.toString();
                                    const list = prev.get(id);
                                    if (!list) return prev;
                                    const copy = [...list];
                                    copy[index] = { ...copy[index], reps: val };
                                    return new Map(prev).set(id, copy);
                                  });
                                }}
                                className="min-h-11 min-w-0 flex-1 px-2 text-center text-base font-bold tabular-nums"
                                disabled={set.completed}
                                aria-label={`Repeticiones serie ${set.setNumber}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-11 shrink-0"
                                onClick={() => updateSetValue(index, "reps", 1)}
                                disabled={set.completed}
                                aria-label="Más repeticiones"
                              >
                                <Plus className="h-5 w-5" aria-hidden />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Tablet / desktop: fila compacta */}
                        <div
                          className={cn(
                            "hidden items-center gap-x-2 sm:grid",
                            usesExternalLoad
                              ? "grid-cols-[2.75rem_4rem_1fr_1fr_auto] lg:grid-cols-[2.75rem_4rem_1fr_1fr_3.5rem]"
                              : "grid-cols-[2.75rem_4rem_1fr_auto] lg:grid-cols-[2.75rem_4rem_1fr_3.5rem]",
                          )}
                        >
                          <div
                            className={cn(
                              "flex size-10 items-center justify-center rounded-full text-sm font-bold",
                              set.completed
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground",
                            )}
                          >
                            {set.completed ? (
                              <Check className="h-5 w-5" aria-hidden />
                            ) : (
                              set.setNumber
                            )}
                          </div>

                          <p className="text-center text-sm font-medium tabular-nums text-muted-foreground">
                            {previewLabel}
                          </p>

                          {usesExternalLoad ? (
                            <div className="flex min-w-0 items-center justify-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-9 shrink-0 xl:size-11"
                                onClick={() =>
                                  updateSetValue(index, "weight", -2.5)
                                }
                                disabled={set.completed}
                                aria-label="Menos peso"
                              >
                                <Minus className="h-4 w-4" aria-hidden />
                              </Button>
                              <Input
                                type="number"
                                inputMode="decimal"
                                value={set.weight}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setSets((prev) => {
                                    const id = currentExercise.id.toString();
                                    const list = prev.get(id);
                                    if (!list) return prev;
                                    const copy = [...list];
                                    copy[index] = {
                                      ...copy[index],
                                      weight: val,
                                    };
                                    return new Map(prev).set(id, copy);
                                  });
                                }}
                                className="h-10 min-w-0 flex-1 px-1 text-center text-sm font-bold tabular-nums xl:h-12 xl:text-lg"
                                disabled={set.completed}
                                aria-label={`Peso serie ${set.setNumber}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-9 shrink-0 xl:size-11"
                                onClick={() =>
                                  updateSetValue(index, "weight", 2.5)
                                }
                                disabled={set.completed}
                                aria-label="Más peso"
                              >
                                <Plus className="h-4 w-4" aria-hidden />
                              </Button>
                            </div>
                          ) : null}

                          <div className="flex min-w-0 items-center justify-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-9 shrink-0 xl:size-11"
                              onClick={() => updateSetValue(index, "reps", -1)}
                              disabled={set.completed}
                              aria-label="Menos repeticiones"
                            >
                              <Minus className="h-4 w-4" aria-hidden />
                            </Button>
                            <Input
                              type="number"
                              inputMode="numeric"
                              value={set.reps}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 1;
                                setSets((prev) => {
                                  const id = currentExercise.id.toString();
                                  const list = prev.get(id);
                                  if (!list) return prev;
                                  const copy = [...list];
                                  copy[index] = { ...copy[index], reps: val };
                                  return new Map(prev).set(id, copy);
                                });
                              }}
                              className="h-10 min-w-0 flex-1 px-1 text-center text-sm font-bold tabular-nums xl:h-12 xl:text-lg"
                              disabled={set.completed}
                              aria-label={`Repeticiones serie ${set.setNumber}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-9 shrink-0 xl:size-11"
                              onClick={() => updateSetValue(index, "reps", 1)}
                              disabled={set.completed}
                              aria-label="Más repeticiones"
                            >
                              <Plus className="h-4 w-4" aria-hidden />
                            </Button>
                          </div>

                          <div className="flex flex-col items-center justify-center gap-1.5">
                            {canRemoveRow ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-10"
                                onClick={() => removeSet(index)}
                                aria-label={`Quitar serie extra ${set.setNumber}`}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                              </Button>
                            ) : null}
                            <Button
                              type="button"
                              variant={set.completed ? "outline" : "default"}
                              size="icon"
                              className={cn(
                                "size-10 shrink-0",
                                !set.completed &&
                                  "bg-primary text-primary-foreground hover:bg-primary/90",
                              )}
                              onClick={() => completeSet(index)}
                              disabled={set.completed}
                              aria-label={`Marcar serie ${set.setNumber} hecha`}
                            >
                              <Check className="h-5 w-5" aria-hidden />
                            </Button>
                          </div>
                        </div>

                        {set.isPR ? (
                          <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3 text-primary sm:mt-2 sm:border-0 sm:pt-2">
                            <Trophy className="h-4 w-4 shrink-0" aria-hidden />
                            <span className="text-sm font-medium">
                              ¡Nuevo récord personal!
                            </span>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-12 w-full gap-2 font-semibold"
                  onClick={addSet}
                >
                  <Plus className="h-5 w-5" aria-hidden />
                  Añadir serie
                </Button>
                {currentSets.length > Math.max(1, currentExercise.sets) ? (
                  <p className="px-0.5 text-center text-xs text-muted-foreground">
                    Las series extra muestran la papelera; no puedes bajar por
                    debajo del plan ({Math.max(1, currentExercise.sets)}{" "}
                    series).
                  </p>
                ) : null}
              </div>

              {allSetsCompleted &&
                currentExerciseIndex < exercises.length - 1 && (
                  <Button
                    className="min-h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    size="lg"
                    onClick={nextExercise}
                  >
                    Siguiente ejercicio
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                )}

              {allSetsCompleted &&
                currentExerciseIndex === exercises.length - 1 && (
                  <Button
                    className="min-h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    size="lg"
                    onClick={finishWorkout}
                    disabled={isFinishing}
                  >
                    Finalizar entrenamiento
                    <Trophy className="ml-2 h-5 w-5" />
                  </Button>
                )}
            </div>
          </div>
        )}
      </main>

      <ExerciseDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        exercise={selectedExercise}
        variant="compact"
      />

      <AchievementUnlockModal
        achievements={newlyUnlocked}
        onClose={() => {
          const sessionId = sessionStorage.getItem("last_session_id");
          setNewlyUnlocked([]);
          if (sessionId) {
            router.push(`/client/workout/summary?sessionId=${sessionId}`);
          }
        }}
      />
    </div>
  );
}
