import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/** Misma envolvente que Mis rutinas / logros: móvil primero, ancho hasta 7xl en desktop. */
export const CLIENT_DATA_PAGE_SHELL =
  'mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6 sm:max-w-4xl sm:px-6 lg:max-w-7xl lg:px-8 pb-24'

/** Cabecera al estilo admin: volver al panel + título + subtítulo (sin duplicar el título en la barra sticky). */
export function ClientStackPageHeader({
  title,
  subtitle,
  backHref = '/client/dashboard',
  backLabel = 'Panel',
}: {
  title: string
  subtitle: string
  backHref?: string
  backLabel?: string
}) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" className="w-fit self-start" asChild>
          <Link href={backHref}>
            <ArrowLeft data-icon="inline-start" aria-hidden />
            {backLabel}
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground text-pretty">{subtitle}</p>
        </div>
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

