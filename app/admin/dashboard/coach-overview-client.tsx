'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AdminDashboardCards } from '@/components/admin/admin-dashboard-cards'
import { Skeleton } from '@/components/ui/skeleton'

const AdminWorkoutChart = dynamic(
  () =>
    import('@/components/admin/admin-workout-chart').then((m) => ({
      default: m.AdminWorkoutChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[220px] w-full rounded-xl" />,
  },
)
import {
  AdminCardWithActions,
  AdminCardHeaderWithActions,
  type AdminCardMenuSection,
} from '@/components/admin/admin-card-with-actions'
import { type CoachClientCard, type CoachOverviewMetrics } from './coach-overview'
import {
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  Eye,
  Edit2,
  Info,
  UserCheck,
  UserX,
  Sparkles,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { updateClientStatus } from '@/app/actions/clients'
import { toast } from 'sonner'

function formatRelativeDays(days: number) {
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  return `hace ${days} días`
}

function MetricHint({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="-m-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={label}
        >
          <Info className="size-3.5 opacity-70" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[min(100vw-1rem,17rem)] text-pretty">
        {children}
      </TooltipContent>
    </Tooltip>
  )
}

function scheduleScrollToElement(el: HTMLElement | null) {
  if (!el) return
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    })
  })
}

export function CoachOverviewClient({
  cards,
  metrics,
  planNames,
  routineNames,
}: {
  cards: CoachClientCard[]
  metrics: CoachOverviewMetrics
  planNames: string[]
  routineNames: string[]
}) {
  const [activeTab, setActiveTab] = useState('all')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [routineFilter, setRoutineFilter] = useState<string>('all')
  const [cardsState, setCardsState] = useState(cards)
  const clientsSectionRef = useRef<HTMLElement>(null)

  const scrollToClientsSection = useCallback(() => {
    scheduleScrollToElement(clientsSectionRef.current)
  }, [])

  useEffect(() => {
    setCardsState(cards)
  }, [cards])

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    try {
      const result = await updateClientStatus(clientId, newStatus)
      if (result?.success) {
        setCardsState((prev) =>
          prev.map((c) => (c.id === clientId ? { ...c, status: newStatus } : c))
        )
        const label = newStatus === 'active' ? 'Activo' : 'Suspendido'
        toast.success(`Asesorado marcado como «${label}».`)
      } else {
        toast.error(result?.error || 'No pudimos cambiar el estado.')
      }
    } catch {
      toast.error('No pudimos cambiar el estado. Revisa tu conexión.')
    }
  }

  const filteredCards = useMemo(() => {
    return cardsState.filter((c) => {
      if (activeTab === 'activeWeek')
        return c.status === 'active' && c.daysSinceLastSession != null && c.daysSinceLastSession <= 6
      if (activeTab === 'inactive3')
        return c.status === 'active' && (c.daysSinceLastSession == null || c.daysSinceLastSession >= 3)
      if (activeTab === 'attention') return c.needsAttention
      if (activeTab === 'all') return true

      return true
    }).filter((c) => {
      if (planFilter === 'all') return true
      return (c.planName || '') === planFilter
    }).filter((c) => {
      if (routineFilter === 'all') return true
      return (c.assignedRoutineName || '') === routineFilter
    })
  }, [cardsState, activeTab, planFilter, routineFilter])

  return (
    <div className="flex flex-1 flex-col gap-6 lg:gap-8">
      <section className="flex flex-col gap-4" aria-label="Resumen y actividad">
        {metrics.attentionCount > 0 ? (
          <Alert
            variant="default"
            className="border-warning/35 bg-warning/10 text-foreground [&>svg]:text-warning"
          >
            <AlertTriangle className="size-4" aria-hidden />
            <AlertTitle className="text-sm font-semibold text-foreground sm:text-base">
              Hay {metrics.attentionCount} asesorado{metrics.attentionCount !== 1 ? 's' : ''} que priorizar
            </AlertTitle>
            <AlertDescription className="flex flex-col gap-3 text-xs text-muted-foreground sm:text-sm">
              <span className="text-pretty leading-relaxed">
                Incluye planes vencidos, sin rutina o sin entrenar varios días. Usa el filtro
                &quot;Atención&quot; para ver la lista completa.
              </span>
              <Button
                type="button"
                size="sm"
                variant="default"
                className="w-full shadow-sm sm:w-fit"
                onClick={() => {
                  setActiveTab('attention')
                  scrollToClientsSection()
                }}
              >
                Ver solo atención
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        <AdminDashboardCards
          totalTrainingsThisWeek={metrics.totalTrainingsThisWeek}
          prsThisMonth={metrics.prsThisMonth}
          prsLastMonth={metrics.prsLastMonth}
          mostActiveClientId={metrics.mostActiveClientId}
          mostActiveClientName={metrics.mostActiveClientName}
          attentionClientId={metrics.attentionClientId}
          attentionClientName={metrics.attentionClientName}
          attentionReason={metrics.attentionReason}
          trainingsLastWeek={metrics.trainingsLastWeek}
          totalClients={metrics.totalClients}
          activeThisWeekCount={metrics.activeThisWeekCount}
          attentionCount={metrics.attentionCount}
        />

        <AdminWorkoutChart data={metrics.chartData} />
      </section>

      <section
        ref={clientsSectionRef}
        className="flex scroll-mt-24 flex-col gap-4 sm:scroll-mt-28"
        aria-label="Listado de asesorados"
        tabIndex={-1}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold tracking-tight sm:text-lg">Tus asesorados</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Filtra por comportamiento real: activos esta semana, baja actividad o casos que necesitan prioridad.
          </p>
        </div>

        <Card className="border-muted/70 shadow-none">
          <CardHeader className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">Filtros</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Puedes combinar pestañas con plan y rutina.
              </CardDescription>
            </div>
            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v)
                if (v === 'attention') scrollToClientsSection()
              }}
              className="w-full sm:w-auto"
            >
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1 sm:w-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="activeWeek" className="text-xs sm:text-sm">
                  Activos 7d
                </TabsTrigger>
                <TabsTrigger value="inactive3" className="text-xs sm:text-sm">
                  Baja actividad
                </TabsTrigger>
                <TabsTrigger value="attention" className="text-xs sm:text-sm">
                  Atención
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-4 pt-0 sm:p-5 sm:pt-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger
                  className="h-11 w-full sm:h-10 sm:min-w-[160px] sm:w-[200px]"
                  aria-label="Filtrar por plan"
                >
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Plan</SelectLabel>
                    <SelectItem value="all">Todos los planes</SelectItem>
                    {planNames.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select value={routineFilter} onValueChange={setRoutineFilter}>
                <SelectTrigger
                  className="h-11 w-full sm:h-10 sm:min-w-[160px] sm:w-[200px]"
                  aria-label="Filtrar por rutina"
                >
                  <SelectValue placeholder="Rutina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Rutina</SelectLabel>
                    <SelectItem value="all">Todas las rutinas</SelectItem>
                    {routineNames.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="h-11 w-full sm:h-10 sm:w-auto"
                type="button"
                onClick={() => {
                  setActiveTab('all')
                  setPlanFilter('all')
                  setRoutineFilter('all')
                }}
              >
                Restablecer filtros
              </Button>
            </div>

            <p className="text-sm font-medium tabular-nums text-muted-foreground">
              {filteredCards.length} resultado{filteredCards.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredCards.map((c) => {
          const menuSections: AdminCardMenuSection[] = [
            {
              items: [
                { label: 'Ver perfil', icon: <Eye className="mr-2 size-4" />, href: `/admin/clients/${c.id}` },
                { label: 'Editar', icon: <Edit2 className="mr-2 size-4" />, href: `/admin/clients/${c.id}/edit` },
              ],
            },
            ...((c.status === 'active' || c.status === 'suspended')
              ? [
                  {
                    separatorBefore: true as const,
                    items: [
                      c.status === 'active'
                        ? {
                            label: 'Suspender',
                            icon: <UserX className="mr-2 size-4" />,
                            onClick: () => handleStatusChange(c.id, 'suspended'),
                            className: 'text-warning focus:text-warning',
                          }
                        : {
                            label: 'Activar',
                            icon: <UserCheck className="mr-2 size-4" />,
                            onClick: () => handleStatusChange(c.id, 'active'),
                            className: 'text-success focus:text-success',
                          },
                    ],
                  },
                ]
              : []),
          ]

          return (
            <AdminCardWithActions
              key={c.id}
              menuSections={menuSections}
              cardClassName={cn(
                c.needsAttention &&
                  'border-border border-l-[3px] border-l-warning bg-warning/5 hover:bg-warning/10 hover:border-l-warning',
              )}
            >
              <AdminCardHeaderWithActions menuSections={menuSections}>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-xl">
                    {c.avatarUrl ? (
                      <AvatarImage src={c.avatarUrl} alt={c.fullName} className="object-cover" />
                    ) : null}
                    <AvatarFallback>{c.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{c.fullName}</CardTitle>
                    <div className="text-xs text-muted-foreground truncate">
                      {c.planName ? `Plan: ${c.planName}` : 'Sin plan'}
                    </div>
                  </div>
                  {c.needsAttention ? (
                    <Badge
                      variant="outline"
                      className="max-w-[min(100%,12rem)] shrink-0 gap-1 border-warning/35 bg-warning/12 text-warning-foreground sm:max-w-[240px] ml-auto [&>svg]:text-current"
                      title={c.attentionReason || 'Atención'}
                    >
                      <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{c.attentionReason || 'Atención'}</span>
                    </Badge>
                  ) : c.streakDays != null && c.streakDays > 0 ? (
                    <Badge variant="outline" className="ml-auto shrink-0 tabular-nums border-primary/25 bg-primary/8">
                      {c.streakDays}d racha
                    </Badge>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-auto shrink-0 cursor-help text-[11px] font-medium tabular-nums text-muted-foreground underline decoration-dotted decoration-muted-foreground/50 underline-offset-2">
                          Racha {c.streakDays ?? '—'}d
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-pretty">
                        Viene del perfil (gamificación): días seguidos con entreno. Si es 0 o «—», el usuario puede haber
                        entrenado hoy igualmente; la racha se reinicia si pasó un día sin completar sesión.
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </AdminCardHeaderWithActions>
              <CardContent className="flex flex-col gap-2.5 pt-2">
                <div className="flex items-baseline justify-between gap-2 border-b border-border/40 pb-2">
                  <span className="text-xs text-muted-foreground">Última sesión</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {c.daysSinceLastSession != null ? formatRelativeDays(c.daysSinceLastSession) : '—'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    Objetivo semanal
                    <MetricHint label="Cómo se calcula el objetivo semanal">
                      Porcentaje según la rutina (días/semana esperados). La ventana son los últimos 7 días naturales, no
                      “7 entrenos”. Ejemplo: rutina 5×/sem → meta 5 sesiones en ese lapso.
                    </MetricHint>
                  </span>
                  <span className="text-right text-sm font-semibold tabular-nums">
                    {c.compliance7dPct != null ? (
                      <>
                        {Math.round(c.compliance7dPct * 100)}%
                        {c.complianceSessionsDone7d != null && c.complianceSessionsTarget != null ? (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            ({c.complianceSessionsDone7d}/{c.complianceSessionsTarget})
                          </span>
                        ) : null}
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    Volumen sesión
                    <MetricHint label="Qué significa la tendencia de volumen">
                      Compara el volumen total (kg) de la última sesión completada frente a la anterior. No es un PR ni
                      mide un solo ejercicio.
                    </MetricHint>
                  </span>
                  <span className="flex min-w-0 items-center justify-end gap-1.5 text-sm font-semibold">
                    {c.trend === 'up' ? (
                      <span className="flex items-center gap-1 text-primary">
                        <ArrowUp className="size-3.5 shrink-0" aria-hidden />
                        Subiendo
                      </span>
                    ) : c.trend === 'down' ? (
                      <span className="flex items-center gap-1 text-destructive">
                        <ArrowDown className="size-3.5 shrink-0" aria-hidden />
                        Bajando
                      </span>
                    ) : (
                      <span className="text-foreground/70">Sin cambio</span>
                    )}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    Series PR · 30d
                    <MetricHint label="Conteo de series PR">
                      Suma series con marca PR en entrenos completados últimos 30 días y eventos en historial PR. Debería
                      acercarse a lo que el asesorado ve en Progreso.
                    </MetricHint>
                  </span>
                  <span className="tabular-nums text-sm font-semibold">
                    {typeof c.prEvents30d === 'number' ? c.prEvents30d : '—'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2 border-t border-border/40 pt-2">
                  <span className="text-xs text-muted-foreground">Rutina</span>
                  <span className="max-w-[60%] truncate text-right text-sm font-semibold">
                    {c.assignedRoutineName ? c.assignedRoutineName : (
                      <span className="font-normal text-muted-foreground">Sin asignar</span>
                    )}
                  </span>
                </div>
              </CardContent>
          </AdminCardWithActions>
          )
        })}
      </div>
      </section>
    </div>
  )
}

