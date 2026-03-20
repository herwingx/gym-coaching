import { SignupForm } from '@/components/signup-form'
import { ThemeToggle } from '@/components/theme-toggle'
import { Dumbbell } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <header className="container flex items-center justify-between py-4">
        <Link href="/auth/login" className="flex items-center gap-2 min-w-0">
          <div className="size-8 shrink-0 rounded-lg bg-primary flex items-center justify-center">
            <Dumbbell className="size-4 text-primary-foreground" />
          </div>
          <span className="font-bold">GymCoach</span>
        </Link>
        <ThemeToggle />
      </header>

      <main id="main-content" className="flex-1 flex items-center justify-center p-6 md:p-10" tabIndex={-1}>
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Únete a GymCoach</h1>
            <p className="text-muted-foreground mt-1">
              Ingresa tu código de invitación para comenzar
            </p>
          </div>
          <SignupForm />
        </div>
      </main>
    </div>
  )
}
