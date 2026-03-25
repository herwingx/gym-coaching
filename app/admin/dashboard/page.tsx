import { getAuthUser, getUserProfile, getUserRole } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CreditCard, Dumbbell, LayoutDashboard, Ticket, UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CoachOverview } from './coach-overview'

export default async function AdminDashboard() {
  const user = await getAuthUser()
  const role = await getUserRole()
  const profile = await getUserProfile()

  if (!user) {
    redirect('/auth/login')
  }

  if (role !== 'admin') {
    redirect('/auth/login')
  }

  const coachFirstName =
    profile?.full_name?.split(/\s+/).filter(Boolean)[0] || 'Coach'
  const todayLabel = format(new Date(), "EEEE d MMM", { locale: es })

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md safe-area-header-pt">
        <div className="container flex flex-col gap-4 py-4 sm:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex flex-col gap-1">
              <p className="text-xs font-medium capitalize text-muted-foreground">{todayLabel}</p>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="size-5 shrink-0 text-muted-foreground" />
                <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                  Hola, {coachFirstName}
                </h1>
              </div>
              <p className="max-w-prose text-sm text-muted-foreground">
                Resumen operativo: sesiones reales, prioridades y tu cartera en un solo vistazo.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/admin/clients/new">
                  <UserPlus data-icon="inline-start" />
                  Nuevo asesorado
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/admin/routines/builder">
                  <Dumbbell data-icon="inline-start" />
                  Rutina
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/admin/clients">
                  <Users data-icon="inline-start" />
                  Gestionar
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/admin/invitations">
                  <Ticket data-icon="inline-start" />
                  Invitaciones
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/admin/payments">
                  <CreditCard data-icon="inline-start" />
                  Pagos
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-4 sm:py-6 lg:py-8">
        <CoachOverview />
      </main>
    </div>
  )
}
