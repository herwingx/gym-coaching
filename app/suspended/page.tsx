import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, LogOut, MessageCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function SuspendedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  
  let title = "Acceso Restringido";
  let description = (
    <>
      Tu acceso a <span className="text-foreground font-bold">RU Coach</span> ha
      sido temporalmente suspendido
    </>
  );
  let icon = <AlertTriangle className="size-10 text-destructive animate-pulse" />;
  let colorClass = "destructive";

  if (status === "pending_payment") {
    title = "Falta Pago";
    description = (
      <>
        Tu cuenta está casi lista. Falta registrar tu pago de suscripción a{" "}
        <span className="text-foreground font-bold">RU Coach</span>.
      </>
    );
    icon = <Clock className="size-10 text-amber-500 animate-pulse" />;
    colorClass = "amber-500";
  } else if (status === "expired") {
    title = "Suscripción Vencida";
    description = (
      <>
        Tu tiempo de acceso a <span className="text-foreground font-bold">RU Coach</span>{" "}
        ha terminado. 
      </>
    );
  }

  return (
    <div
      id="main-content"
      role="main"
      className="min-h-dvh bg-background flex items-center justify-center p-6"
      tabIndex={-1}
    >
      <Card className={`w-full max-w-md text-center border-${colorClass}/20 shadow-2xl shadow-${colorClass}/10`}>
        <CardHeader className="pb-4">
          <div className={`mx-auto size-20 rounded-full bg-${colorClass}/10 flex items-center justify-center mb-6 ring-1 ring-${colorClass}/20`}>
            {icon}
          </div>
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">
            {title}
          </CardTitle>
          <CardDescription className="text-base font-medium">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="p-5 bg-muted/50 rounded-xl text-left space-y-3 border border-border/50">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Estado de la cuenta:
            </p>
            <ul className="text-sm text-foreground/80 space-y-2 font-medium">
              {status === "pending_payment" ? (
                <>
                  <li className="flex items-center gap-2">
                    <div className={`size-1.5 rounded-full bg-${colorClass}`} />
                    Registro de cuenta completado
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`size-1.5 rounded-full bg-border`} />
                    Pago de suscripción pendiente
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`size-1.5 rounded-full bg-border`} />
                    Activación administrativa
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <div className={`size-1.5 rounded-full bg-${colorClass}`} />
                    Pago de suscripción requerido
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`size-1.5 rounded-full bg-${colorClass}`} />
                    Revisión administrativa necesaria
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full gap-2 h-12 text-base font-bold uppercase tracking-tight"
              variant="default"
              asChild
            >
              <Link href="/messages">
                <MessageCircle className="size-5" />
                Contactar a Rodrigo Urbina
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2 h-12 text-sm font-semibold"
              asChild
            >
              <Link href="/auth/logout" prefetch={false}>
                <LogOut className="size-4" />
                Cerrar Sesión
              </Link>
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            Rodrigo Urbina - Coaching de Élite
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
