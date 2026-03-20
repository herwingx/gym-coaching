import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NewClientForm } from './new-client-form'

export default async function NewClientPage() {
  const user = await getAuthUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-background">
        <div className="container flex items-center gap-4 py-4 sm:py-5">
          <Button variant="ghost" size="icon" asChild className="size-9 sm:size-10">
            <Link href="/admin/clients">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Nuevo asesorado</h1>
            <p className="text-sm text-muted-foreground">Agrega un nuevo asesorado a tu lista</p>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-2xl">
        <NewClientForm />
      </main>
    </div>
  )
}
