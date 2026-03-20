import { getAuthUser, getUserRole } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { CoachOverview } from './coach-overview'

export default async function AdminDashboard() {
  const user = await getAuthUser()
  const role = await getUserRole()

  if (!user) {
    redirect('/auth/login')
  }

  if (role !== 'admin') {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm safe-area-header-pt">
        <div className="container py-4 sm:py-5">
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight sm:text-2xl">Panel del Coach</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Visión rápida de tus asesorados</p>
          </div>
        </div>
      </header>

      <main className="container py-4 sm:py-6 lg:py-8">
        <CoachOverview />
      </main>
    </div>
  )
}
