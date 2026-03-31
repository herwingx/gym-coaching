import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

/** Misma envolvente que Mis rutinas / logros: móvil primero, ancho hasta 7xl en desktop. */
export const CLIENT_DATA_PAGE_SHELL =
  'container min-w-0 py-8 pb-24'

/** Cabecera al estilo admin: volver al panel + título + subtítulo (sin duplicar el título en la barra sticky). */
export function ClientStackPageHeader({
  title,
  subtitle,
  backHref = '/client/dashboard',
  backLabel = 'Volver',
  backIcon,
  /** Si se define, el botón móvil llama aquí en lugar de navegar directo (p. ej. confirmar salida del entreno). */
  onBackClick,
  actions,
  sticky = false,
  className,
}: {
  title: string
  subtitle?: string | React.ReactNode
  backHref?: string | null
  backLabel?: string
  backIcon?: React.ReactNode
  onBackClick?: () => void
  actions?: React.ReactNode
  sticky?: boolean
  className?: string
}) {
  return (
    <header
      className={cn(
        'border-b border-border bg-background/80 backdrop-blur-md',
        sticky && 'sticky top-0 z-50 safe-area-header-pt',
        className,
      )}
    >
      <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          {backHref ? (
            onBackClick ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label={backLabel}
                onClick={onBackClick}
              >
                {backIcon ?? <ArrowLeft className="size-5" aria-hidden />}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="shrink-0"
                aria-label={backLabel}
              >
                <Link href={backHref}>
                  {backIcon ?? <ArrowLeft className="size-5" aria-hidden />}
                </Link>
              </Button>
            )
          ) : (
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 size-9 shrink-0 sm:size-8" />
              <div className="flex items-center gap-2 lg:hidden">
                <div className="size-7 rounded-lg overflow-hidden ring-1 ring-border shadow-sm shrink-0">
                  <img src="/android-chrome-192x192.png" alt="Logo" className="size-full object-cover" />
                </div>
              </div>
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-pretty sm:text-2xl">
              {title}
            </h1>
            {subtitle ? (
              typeof subtitle === 'string' ? (
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground text-pretty sm:text-sm">
                  {subtitle}
                </p>
              ) : (
                <div className="mt-0.5">{subtitle}</div>
              )
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}

export function ClientIncompleteProfileCard() {
  return (
    <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Perfil incompleto</CardTitle>
        <CardDescription>
          Tu perfil de cliente aún no ha sido configurado. Contacta a tu entrenador.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

