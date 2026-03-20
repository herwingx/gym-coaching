import { getAuthUser, getUserRole } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { AdminLayoutShell } from '@/components/admin-layout-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()
  const role = await getUserRole()

  if (!user) {
    redirect('/auth/login')
  }

  if (role !== 'admin') {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </div>
  )
}
