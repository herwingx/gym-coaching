import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div id="main-content" role="main" className="flex min-h-dvh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted" tabIndex={-1}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="size-12 text-success" />
              </div>
              <CardTitle className="text-2xl">¡Registro Completado!</CardTitle>
              <CardDescription>
                Verifica tu email para confirmar tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Hemos enviado un email de confirmación a tu dirección. Por favor, haz clic en el enlace del email para verificar tu cuenta y poder iniciar sesión.
                </p>
                <p className="text-sm text-muted-foreground">
                  Si no ves el email en tu bandeja de entrada, revisa la carpeta de spam.
                </p>
                <div className="pt-4 flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link href="/auth/login">
                      Volver al Iniciar Sesión
                    </Link>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Si ya verificaste tu email, puedes iniciar sesión ahora.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
