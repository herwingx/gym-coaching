import { getAuthData } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { ClientLayoutShell } from '@/components/client-layout-shell'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role, profile } = await getAuthData()

  if (!user || (role !== 'client' && role !== 'admin')) {
    redirect('/auth/login')
  }

  // Redirigir si está suspendido
  if (profile?.subscription_status === 'suspended' || profile?.subscription_status === 'expired') {
    redirect('/suspended')
  }

  // Redirigir a onboarding si no está completado
  if (profile && !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <ClientLayoutShell>{children}</ClientLayoutShell>
    </div>
  )
}
