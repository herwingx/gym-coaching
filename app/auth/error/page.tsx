import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div
      id="main-content"
      role="main"
      className="flex min-h-dvh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted"
      tabIndex={-1}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="size-12 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Error de Autenticación</CardTitle>
              <CardDescription>
                Hubo un problema al procesar tu solicitud
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {message ||
                    "No pudimos procesar tu solicitud de autenticación. Por favor, intenta de nuevo o contacta al soporte si el problema persiste."}
                </p>
                <div className="pt-4 flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link href="/auth/login">Volver a Iniciar Sesión</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/sign-up">Crear Nueva Cuenta</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
