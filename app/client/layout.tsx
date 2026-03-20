import { getAuthUser, getUserRole } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()
  const role = await getUserRole()

  if (!user) {
    redirect('/auth/login')
  }

  if (role !== 'client') {
    redirect('/auth/login')
  }

  return children
}
