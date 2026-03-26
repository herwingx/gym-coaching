import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { NewClientForm } from './new-client-form'

export default async function NewClientPage() {
  const user = await getAuthUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-dvh bg-background">
      <AdminPageHeader
        title="Nuevo asesorado"
        description="Agrega un nuevo asesorado a tu lista"
        backHref="/admin/clients"
        backLabel="Volver a asesorados"
      />

      <main className="container py-8 max-w-2xl">
        <NewClientForm />
      </main>
    </div>
  )
}
