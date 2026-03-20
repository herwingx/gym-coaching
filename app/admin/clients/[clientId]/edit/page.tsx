import { getAuthUser, getUserRole } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EditClientForm } from './edit-client-form'

interface Props {
  params: Promise<{ clientId: string }>
}

export default async function EditClientPage({ params }: Props) {
  const user = await getAuthUser()
  const role = await getUserRole()
  const { clientId } = await params

  if (!user) redirect('/auth/login')
  if (role !== 'admin') redirect('/auth/login')

  const supabase = await createClient()
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (error || !client) redirect('/admin/clients')

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-background">
        <div className="container flex items-center gap-4 py-4 sm:py-5">
          <Button variant="ghost" size="icon" asChild className="size-9 sm:size-10">
            <Link href={`/admin/clients/${clientId}`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Editar asesorado</h1>
            <p className="text-sm text-muted-foreground">{client.full_name}</p>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-2xl">
        <EditClientForm client={client} />
      </main>
    </div>
  )
}
