import { redirect } from 'next/navigation'

export default function AdminSetupPage() {
  redirect('/auth/sign-up')
}
