import { getAuthData } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'

export default async function ReceptionistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role } = await getAuthData()

  if (!user || (role !== 'receptionist' && role !== 'admin')) {
    redirect('/auth/login')
  }

  return <>{children}</>
}
