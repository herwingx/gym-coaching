import { getAuthUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ReceptionistCheckInPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="container flex items-center gap-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Volver al dashboard"
          >
            <Link href="/receptionist/dashboard">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Registro de Entrada</h1>
        </div>
      </header>

      <main id="main-content" className="container py-8" tabIndex={-1}>
        <Card>
          <CardHeader>
            <CardTitle>Registrar Entrada de Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Próximamente podrás registrar la entrada de clientes aquí.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
