import { redirect } from 'next/navigation'
import { getAuthUser, getUserRole } from '@/lib/auth-utils'

export default async function DashboardPage() {
  const user = await getAuthUser()
  const role = await getUserRole()

  if (!user) redirect('/auth/login')

  if (role === 'admin') redirect('/admin/dashboard')
  if (role === 'receptionist') redirect('/receptionist/dashboard')
  if (role === 'client') redirect('/client/dashboard')

  redirect('/auth/login')
}
