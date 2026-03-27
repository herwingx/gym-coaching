import { LoginForm } from '@/components/login-form'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row bg-background">
      {/* Columna Izquierda: Formulario */}
      <div className="flex flex-1 flex-col p-6 sm:p-10 lg:p-16 justify-between lg:max-w-xl xl:max-w-2xl">
        <header className="flex items-center justify-between">
          <Link href="/auth/login" className="flex items-center gap-2.5 group" aria-label="GymCoach - Inicio">
            <div className="size-10 shrink-0 rounded-xl overflow-hidden shadow-md ring-1 ring-border transition-transform group-hover:scale-105">
              <img 
                src="/android-chrome-512x512.png" 
                alt="GymCoach Logo" 
                className="size-full object-cover"
              />
            </div>
            <span className="font-bold text-xl tracking-tight">GymCoach</span>
          </Link>
          <ThemeToggle />
        </header>

        <main id="main-content" className="flex-1 flex flex-col justify-center py-12" tabIndex={-1}>
          <div className="w-full max-w-sm mx-auto lg:mx-0">
            <div className="space-y-2 mb-8 text-center lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight">Bienvenido de nuevo</h1>
              <p className="text-muted-foreground">
                Ingresa tus credenciales para acceder a tu entrenamiento.
              </p>
            </div>
            <LoginForm />
          </div>
        </main>

        <footer className="pt-8 text-center lg:text-left">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 GymCoach Premium. Entrenamiento basado en ciencia.
          </p>
        </footer>
      </div>

      {/* Columna Derecha: Imagen Premium (Desktop) */}
      <div className="relative hidden flex-1 lg:block bg-muted">
        <img
          src="/img-login.jpg"
          alt="GymCoach Training"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Overlays para cohesión visual */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-linear-to-r from-background/40 via-transparent to-transparent" />
        
        {/* Frase Motivadora Flotante */}
        <div className="absolute bottom-12 left-12 right-12">
          <div className="max-w-md space-y-4 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="text-primary text-xl">💪</span>
            </div>
            <blockquote className="space-y-2">
              <p className="text-xl font-medium leading-relaxed text-white">
                "La disciplina es el puente entre tus metas y tus logros. Cada set cuenta, cada repetición importa."
              </p>
              <footer className="text-sm text-gray-400 font-medium">
                — GymCoach Motivation
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  )
}
