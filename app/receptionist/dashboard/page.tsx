import { getAuthUser, getUserRole } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Users, Calendar, CreditCard, CheckCircle } from 'lucide-react'

export default async function ReceptionistDashboard() {
  const user = await getAuthUser()
  const role = await getUserRole()

  if (!user) {
    redirect('/auth/login')
  }

  if (role !== 'receptionist') {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Header - mobile-first */}
      <header className="sticky top-0 z-40 border-b bg-background safe-area-header-pt">
        <div className="container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl truncate">GymCoach Recepción</h1>
            <p className="text-sm text-muted-foreground">Panel de recepcionista</p>
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
            <Link href="/auth/logout">Cerrar Sesión</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="container py-8" tabIndex={-1}>
        <div className="grid gap-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle>Bienvenido, Recepcionista</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Gestiona el acceso de clientes, registra pagos y mantén el control de asistencia.
              </p>
            </CardContent>
          </Card>

          {/* Stats - mobile: 2 cols, tablet+: 4 cols */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Clientes Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Asistencias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Clases Programadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Hoy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Pagos Registrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$0</p>
                <p className="text-xs text-muted-foreground">Hoy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Membresías Vencidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Acciones pendientes</p>
              </CardContent>
            </Card>
          </div>

          {/* Navigation to Features */}
          <Card>
            <CardHeader>
              <CardTitle>Funciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
                <Button asChild variant="outline" className="w-full min-h-[44px] h-auto py-6 flex-col gap-2 transition-colors duration-200">
                  <Link href="/receptionist/check-in">
                    <CheckCircle className="w-5 h-5" />
                    <span>Registro de Entrada</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full min-h-[44px] h-auto py-6 flex-col gap-2 transition-colors duration-200">
                  <Link href="/receptionist/payments">
                    <CreditCard className="w-5 h-5" />
                    <span>Registrar Pago</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full min-h-[44px] h-auto py-6 flex-col gap-2 transition-colors duration-200">
                  <Link href="/receptionist/clients">
                    <Users className="w-5 h-5" />
                    <span>Ver Clientes</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
