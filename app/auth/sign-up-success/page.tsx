import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { CheckCircle2, ArrowLeft } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md overflow-hidden">
              <img src="/android-chrome-512x512.png" alt="Logo RU Coach" className="size-full" />
            </div>
            <div className="flex flex-col leading-none"><span className="text-xl font-black tracking-tighter uppercase">RU Coach</span><span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">Rodrigo Urbina</span></div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
                <div className="size-16 rounded-full bg-success/10 flex items-center justify-center border border-success/20">
                  <CheckCircle2 className="size-8 text-success" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">¡Registro completado!</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    Casi has terminado. Hemos enviado un enlace de verificación a tu correo electrónico.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/30 p-6 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Por favor, haz clic en el enlace del email para verificar tu cuenta y poder acceder a tu plan de entrenamiento.
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    Si no ves el email en tu bandeja de entrada, recuerda revisar la carpeta de spam.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button asChild className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer transition-all duration-200">
                    <Link href="/auth/login">
                      <ArrowLeft className="size-4 mr-2" />
                      Ir al inicio de sesión
                    </Link>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    ¿Ya verificaste tu email? Ya puedes iniciar sesión.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center md:justify-start">
          <ThemeToggle />
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/img-login.jpg"
          alt="RU Coach Training"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] dark:grayscale-[0.2] transition-all duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent lg:from-background/20" />
        
        {/* Success badge overlay */}
        <div className="absolute top-10 right-10">
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-2xl">
            <span className="text-white text-sm font-medium">✨ Paso 1 completado</span>
          </div>
        </div>
      </div>
    </div>
  )
}
