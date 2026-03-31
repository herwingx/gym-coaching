import { getAuthUser, getUserRole } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Users, Calendar, CreditCard, CheckCircle } from "lucide-react";

export default async function ReceptionistDashboard() {
  const user = await getAuthUser();
  const role = await getUserRole();

  if (!user) {
    redirect("/auth/login");
  }

  if (role !== "receptionist") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Header - mobile-first */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md safe-area-header-pt">
        <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div className="min-w-0">
            <h1 className="text-2xl font-black uppercase tracking-tighter">
              RU Coach <span className="text-primary/80">Recepción</span>
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
              Rodrigo Urbina - Gestión de Acceso
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto h-10 font-bold uppercase tracking-tighter border-border/50 hover:bg-muted/50"
            asChild
          >
            <Link href="/auth/logout" prefetch={false}>
              Cerrar Sesión
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="container py-8" tabIndex={-1}>
        <div className="grid gap-8">
          {/* Welcome Card */}
          <Card className="border-none bg-gradient-to-br from-primary/10 via-background to-background shadow-xl ring-1 ring-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-black uppercase tracking-tight">
                Bienvenido al Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-medium text-pretty max-w-2xl">
                Gestiona el acceso de atletas, registra pagos y mantén el
                control operativo de la comunidad RU Coach.
              </p>
            </CardContent>
          </Card>

          {/* Stats - mobile: 2 cols, tablet+: 4 cols */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/30">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                  <Users className="size-3.5 text-primary" />
                  Atletas Hoy
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-3xl font-black tracking-tighter">0</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Asistencias confirmadas
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/30">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-3.5 text-primary" />
                  Programación
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-3xl font-black tracking-tighter">0</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Sesiones agendadas
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/30">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="size-3.5 text-primary" />
                  Recaudación
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-3xl font-black tracking-tighter">$0</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Ingresos del día
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/30">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="size-3.5 text-destructive" />
                  Expirados
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-3xl font-black tracking-tighter text-destructive/80">
                  0
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Planes por renovar
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Navigation to Features */}
          <Card className="border-border/50 shadow-sm bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase tracking-tight">
                Operaciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-auto py-8 flex-col gap-4 transition-all duration-300 border-border/50 bg-background hover:bg-primary/5 hover:border-primary/20 group"
                >
                  <Link href="/receptionist/check-in">
                    <CheckCircle className="size-8 text-primary/60 group-hover:text-primary transition-colors" />
                    <div className="flex flex-col items-center">
                      <span className="font-black uppercase tracking-tighter text-base">
                        Check-In Atletas
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Registrar Entrada
                      </span>
                    </div>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-auto py-8 flex-col gap-4 transition-all duration-300 border-border/50 bg-background hover:bg-primary/5 hover:border-primary/20 group"
                >
                  <Link href="/receptionist/payments">
                    <CreditCard className="size-8 text-primary/60 group-hover:text-primary transition-colors" />
                    <div className="flex flex-col items-center">
                      <span className="font-black uppercase tracking-tighter text-base">
                        Registrar Pago
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Membresías y Más
                      </span>
                    </div>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-auto py-8 flex-col gap-4 transition-all duration-300 border-border/50 bg-background hover:bg-primary/5 hover:border-primary/20 group"
                >
                  <Link href="/receptionist/clients">
                    <Users className="size-8 text-primary/60 group-hover:text-primary transition-colors" />
                    <div className="flex flex-col items-center">
                      <span className="font-black uppercase tracking-tighter text-base">
                        Directorio Atletas
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Búsqueda y Perfiles
                      </span>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
