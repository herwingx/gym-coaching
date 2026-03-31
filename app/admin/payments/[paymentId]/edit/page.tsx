import { getAuthUser } from "@/lib/auth-utils";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { EditPaymentForm } from "./edit-payment-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default async function EditPaymentPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/auth/login");

  const { paymentId } = await params;
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select(
      `
      *,
      clients (full_name, email)
    `,
    )
    .eq("id", paymentId)
    .single();

  if (!payment) notFound();

  return (
    <div className="bg-background">
      <AdminPageHeader
        sticky
        title="Editar pago"
        description={`${payment.clients?.full_name ?? "Cliente"} • $${payment.amount?.toFixed(2) ?? "0.00"}`}
        backHref="/admin/payments"
        backLabel="Volver a pagos"
      />
      <main className="container py-8">
        <EditPaymentForm payment={payment} />
      </main>
    </div>
  );
}
