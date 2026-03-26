import { getAuthData } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { ClientLayoutShell } from '@/components/client-layout-shell'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role } = await getAuthData()

  if (!user || role !== 'client') {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <ClientLayoutShell>{children}</ClientLayoutShell>
    </div>
  )
}
