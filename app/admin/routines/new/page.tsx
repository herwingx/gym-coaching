import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NewRoutineForm } from './new-routine-form'

export default async function NewRoutinePage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="bg-background">
      <header className="border-b">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/routines">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Crear Nueva Rutina</h1>
        </div>
      </header>

      <main className="container py-8 max-w-2xl">
        <NewRoutineForm />
      </main>
    </div>
  )
}
