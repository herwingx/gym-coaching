import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function AdminRoutinesPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()
  const { data: routines } = await supabase
    .from('routines')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold">Rutinas de Entrenamiento</h1>
            <p className="text-sm text-muted-foreground">
              {routines?.length || 0} rutina{routines?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/routines/new">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Rutina
            </Link>
          </Button>
        </div>
      </header>

      <main className="container py-8">
        {!routines || routines.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No hay rutinas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No tienes rutinas creadas aún. Crea una nueva para asignarla a tus clientes.
              </p>
              <Button asChild>
                <Link href="/admin/routines/new">Crear primera rutina</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {routines.map((routine) => (
              <Card key={routine.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{routine.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{routine.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nivel:</span>
                      <span className="capitalize">{routine.level || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duración:</span>
                      <span>{routine.duration_weeks || '-'} semanas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Días/semana:</span>
                      <span>{routine.days_per_week || '-'}</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/admin/routines/${routine.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
