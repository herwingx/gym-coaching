import { getAuthData } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { AdminLayoutShell } from "@/components/admin-layout-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, profile } = await getAuthData();

  if (!user || role !== "admin") {
    redirect("/auth/login");
  }

  // Redirigir a onboarding si no está completado
  if (profile && !profile.onboarding_completed) {
    redirect("/admin/onboarding");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </div>
  );
}
