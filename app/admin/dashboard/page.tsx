import { getAuthData } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CreditCard,
  Dumbbell,
  Library,
  Ticket,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoachOverview } from "./coach-overview";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default async function AdminDashboard() {
  const { user, role, profile } = await getAuthData();

  if (!user || role !== "admin") {
    redirect("/auth/login");
  }

  const coachFirstName =
    profile?.full_name?.split(/\s+/).filter(Boolean)[0] || "Coach";
  const todayLabel = format(new Date(), "EEEE d MMM", { locale: es });

  return (
    <div className="min-h-dvh bg-background">
      <AdminPageHeader
        sticky
        className="bg-background/90 backdrop-blur-md"
        kicker={todayLabel}
        title={`Hola, ${coachFirstName}`}
        description="Resumen operativo: sesiones reales, prioridades y tu cartera en un solo vistazo."
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/clients/new">
              <UserPlus data-icon="inline-start" />
              Nuevo asesorado
            </Link>
          </Button>
        }
      />

      <main className="container py-4 sm:py-6 lg:py-8">
        <CoachOverview />
      </main>
    </div>
  );
}
