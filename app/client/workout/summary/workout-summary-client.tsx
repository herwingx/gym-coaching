"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { applyProgressionToRoutineDay, updateWorkoutSessionFeelingNote } from "@/app/actions/workout"
import { Clock, Dumbbell, Layers, Trophy, Sparkles, CheckCircle2, Loader2, AlertCircle } from "lucide-react"

const AUTO_APPLY_PREF_KEY = "gym-coaching:auto-apply-progression"

function getAppliedStorageKey(sessionId: string) {
  return `gym-progression-applied:${sessionId}`
}

function readAutoApplyPref(): boolean {
  if (typeof window === "undefined") return true
  try {
    return window.localStorage.getItem(AUTO_APPLY_PREF_KEY) !== "false"
  } catch {
    return true
  }
}

function writeAutoApplyPref(value: boolean) {
  try {
    window.localStorage.setItem(AUTO_APPLY_PREF_KEY, value ? "true" : "false")
  } catch {
    /* noop */
  }
}

type ProgressionPhase = "applying" | "done" | "error" | "manual" | "no_day"

export function WorkoutSummaryClient({
  sessionId,
  clientId,
  routineDayId,
  routineName,
  dayName,
  durationMinutes,
  totalVolumeKg,
  finishedAt,
  initialFeelingNote,
  stats,
}: {
  sessionId: string
  clientId: string
  routineDayId: string | null
  routineName?: string | null
  dayName?: string | null
  durationMinutes: number | null
  totalVolumeKg: number | null
  finishedAt: string | null
  initialFeelingNote: string | null
  stats: { totalSets: number; prsCount: number; totalVolume: number }
}) {
  const [autoApplyAfterSessions, setAutoApplyAfterSessions] = useState(true)
  const [progressionPhase, setProgressionPhase] = useState<ProgressionPhase>(() =>
    routineDayId ? "applying" : "no_day",
  )
  const [progressionError, setProgressionError] = useState<string | null>(null)
  const [isApplyingManual, setIsApplyingManual] = useState(false)
  const ranAutoRef = useRef(false)

  const [note, setNote] = useState(initialFeelingNote ?? "")
  const [isSavingNote, setIsSavingNote] = useState(false)

  const volumeKg = useMemo(() => {
    if (totalVolumeKg != null && totalVolumeKg > 0) return Math.round(totalVolumeKg)
    return Math.round(stats.totalVolume)
  }, [totalVolumeKg, stats.totalVolume])

  const dateLabel = useMemo(() => {
    const src = finishedAt
    if (!src) return null
    try {
      return new Date(src).toLocaleString("es", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    } catch {
      return null
    }
  }, [finishedAt])

  useEffect(() => {
    setAutoApplyAfterSessions(readAutoApplyPref())
  }, [])

  const runProgression = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!routineDayId) {
      return { ok: false, error: "Sin día de rutina vinculado" }
    }
    const result = await applyProgressionToRoutineDay({ clientId, routineDayId })
    if (!result.success) {
      setProgressionError(result.error)
      setProgressionPhase("error")
      return { ok: false, error: result.error }
    }
    try {
      sessionStorage.setItem(getAppliedStorageKey(sessionId), "1")
    } catch {
      /* noop */
    }
    setProgressionPhase("done")
    setProgressionError(null)
    return { ok: true }
  }, [clientId, routineDayId, sessionId])

  useEffect(() => {
    if (!routineDayId) {
      setProgressionPhase("no_day")
      return
    }

    if (ranAutoRef.current) return

    try {
      if (sessionStorage.getItem(getAppliedStorageKey(sessionId))) {
        setProgressionPhase("done")
        ranAutoRef.current = true
        return
      }
    } catch {
      /* noop */
    }

    if (!readAutoApplyPref()) {
      setProgressionPhase("manual")
      ranAutoRef.current = true
      return
    }

    ranAutoRef.current = true
    setProgressionPhase("applying")
    ;(async () => {
      const res = await runProgression()
      if (res.ok) {
        toast.success("Sugerencias de peso actualizadas para la próxima sesión.")
      } else {
        toast.error("No se pudieron actualizar las sugerencias", {
          description: res.error,
        })
      }
    })()
  }, [routineDayId, sessionId, runProgression])

  const onAutoPrefChange = (checked: boolean) => {
    setAutoApplyAfterSessions(checked)
    writeAutoApplyPref(checked)
  }

  const onSaveNote = async () => {
    setIsSavingNote(true)
    try {
      const result = await updateWorkoutSessionFeelingNote(sessionId, note)
      if (!result.success) {
        toast.error("No se pudo guardar la nota", { description: result.error })
        return
      }
      toast.success("Nota guardada")
    } catch (e) {
      console.error(e)
      toast.error("Error al guardar la nota")
    } finally {
      setIsSavingNote(false)
    }
  }

  const onApplyManual = async () => {
    if (!routineDayId) {
      toast.error("Esta sesión no está ligada a un día de rutina")
      return
    }
    setIsApplyingManual(true)
    setProgressionError(null)
    setProgressionPhase("applying")
    try {
      const res = await runProgression()
      if (res.ok) {
        toast.success("Progresión aplicada a tu rutina")
      } else {
        toast.error("No se pudo aplicar la progresión", { description: res.error })
      }
    } finally {
      setIsApplyingManual(false)
    }
  }

  const onRetryAfterError = async () => {
    setProgressionPhase("applying")
    setProgressionError(null)
    const res = await runProgression()
    if (res.ok) {
      toast.success("Sugerencias de peso actualizadas para la próxima sesión.")
    } else {
      toast.error("Sigue sin poder actualizarse", { description: res.error })
    }
  }

  const onRecalculate = async () => {
    setProgressionPhase("applying")
    setProgressionError(null)
    const res = await runProgression()
    if (res.ok) {
      toast.success("Sugerencias recalculadas.")
    } else {
      toast.error("No se pudo recalcular", { description: res.error })
    }
  }

  const titleRoutine = routineName || "Tu rutina"
  const subtitleDay = dayName ? `· ${dayName}` : null

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
      <section className="flex flex-col gap-6 lg:col-span-7">
        <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Sesión</CardDescription>
            <CardTitle className="text-balance text-xl sm:text-2xl">
              {titleRoutine}{" "}
              {subtitleDay ? (
                <span className="font-medium text-muted-foreground">{subtitleDay}</span>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-3 border-y border-border/60 py-4 sm:gap-4">
              <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Clock className="size-3.5 text-primary" aria-hidden />
                  Duración
                </span>
                <span className="text-lg font-bold tabular-nums text-primary sm:text-xl">
                  {durationMinutes != null ? durationMinutes : "—"} min
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Dumbbell className="size-3.5 text-primary" aria-hidden />
                  Volumen
                </span>
                <span className="text-lg font-bold tabular-nums sm:text-xl">{volumeKg} kg</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Layers className="size-3.5 text-primary" aria-hidden />
                  Series
                </span>
                <span className="text-lg font-bold tabular-nums sm:text-xl">{stats.totalSets}</span>
              </div>
            </div>

            {dateLabel ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Fecha</p>
                <p className="mt-1 text-sm font-medium tabular-nums text-foreground">{dateLabel}</p>
              </div>
            ) : null}

            <div className="space-y-2">
              <label htmlFor="workout-feeling-note" className="text-sm font-medium">
                ¿Cómo ha ido?
              </label>
              <Textarea
                id="workout-feeling-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Energía, dolores, sensaciones… útil para ti y tu coach."
                className="min-h-24 text-base md:text-sm"
                maxLength={2000}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
                disabled={isSavingNote}
                onClick={onSaveNote}
              >
                {isSavingNote ? "Guardando…" : "Guardar nota"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="min-h-11 flex-1 font-semibold">
            <Link href="/client/dashboard">Volver al inicio</Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11 flex-1 font-medium">
            <Link href="/client/workouts">Ver historial</Link>
          </Button>
        </div>
      </section>

      <aside className="flex flex-col gap-6 lg:sticky lg:top-[max(1rem,env(safe-area-inset-top))] lg:col-span-5 lg:self-start">
        <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 shrink-0 text-primary" aria-hidden />
              <CardTitle className="text-base sm:text-lg">Rendimiento</CardTitle>
            </div>
            <CardDescription>Récords registrados en esta sesión (logs)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-primary">{stats.prsCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              PRs detectados según tus series marcadas y tu historial.
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 shrink-0 text-primary" aria-hidden />
              <CardTitle className="text-base sm:text-lg">Progresión</CardTitle>
            </div>
            <CardDescription>
              Actualizamos los pesos sugeridos de este día según tus PRs y límites (se respeta dolor fuerte activo).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {progressionPhase === "no_day" ? (
              <p className="text-sm text-muted-foreground text-pretty">
                Esta sesión no está vinculada a un día de rutina; no hay sugerencias que actualizar aquí.
              </p>
            ) : null}

            {progressionPhase === "applying" ? (
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                <Loader2 className="size-5 shrink-0 animate-spin text-primary" aria-hidden />
                <p className="text-sm font-medium text-foreground">Actualizando sugerencias…</p>
              </div>
            ) : null}

            {progressionPhase === "done" ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
                  <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Listo</p>
                    <p className="mt-1 text-sm text-muted-foreground text-pretty">
                      La próxima vez que hagas este día, verás los pesos sugeridos alineados con tu último rendimiento.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={onRecalculate}
                >
                  Volver a calcular
                </Button>
              </div>
            ) : null}

            {progressionPhase === "error" ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <AlertCircle className="size-5 shrink-0 text-destructive" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">No se pudo actualizar</p>
                    <p className="mt-1 text-sm text-muted-foreground text-pretty">
                      {progressionError ?? "Error desconocido"}
                    </p>
                  </div>
                </div>
                <Button type="button" className="w-full" onClick={onRetryAfterError}>
                  Reintentar
                </Button>
              </div>
            ) : null}

            {progressionPhase === "manual" ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground text-pretty">
                  Tienes desactivada la actualización automática. Puedes aplicar ahora o activar el interruptor abajo para
                  que se haga sola al terminar cada entreno.
                </p>
                <Button
                  type="button"
                  className="min-h-11 w-full font-semibold"
                  onClick={onApplyManual}
                  disabled={isApplyingManual || !routineDayId}
                >
                  {isApplyingManual ? "Aplicando…" : "Aplicar progresión ahora"}
                </Button>
              </div>
            ) : null}

            {routineDayId && progressionPhase !== "no_day" ? (
              <label className="flex items-start justify-between gap-4 border-t border-border/60 pt-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium">Actualizar sugerencias al cerrar el entreno</div>
                  <div className="text-sm text-muted-foreground text-pretty">
                    Activado: se aplican solas al abrir este resumen. Desactivado: tú pulsas aplicar (útil en descargas o si el
                    coach ajusta el plan a mano).
                  </div>
                </div>
                <Switch
                  checked={autoApplyAfterSessions}
                  onCheckedChange={onAutoPrefChange}
                  aria-label="Actualizar sugerencias automáticamente tras cada entreno"
                />
              </label>
            ) : null}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
