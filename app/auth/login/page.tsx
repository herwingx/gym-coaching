import { LoginForm } from '@/components/login-form'
import { ThemeToggle } from '@/components/theme-toggle'
import { Dumbbell } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <header className="container flex items-center justify-between py-4">
        <Link href="/auth/login" className="flex items-center gap-2 min-w-0 min-h-[44px] items-center" aria-label="GymCoach - Inicio">
          <div className="size-8 shrink-0 rounded-lg bg-primary flex items-center justify-center">
            <Dumbbell className="size-4 text-primary-foreground" />
          </div>
          <span className="font-bold">GymCoach</span>
        </Link>
        <ThemeToggle />
      </header>

      <main id="main-content" className="flex-1 flex items-center justify-center p-6 md:p-10" tabIndex={-1}>
        <div className="w-full max-w-sm md:max-w-4xl">
          <LoginForm />
        </div>
      </main>
    </div>
  )
}
