"use client";

import { useState, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AdminCardWithActions,
  AdminCardHeaderWithActions,
  type AdminCardMenuSection,
} from "@/components/admin/admin-card-with-actions";
import { Eye, Edit2, Trash2 } from "lucide-react";
import { deletePayment } from "@/app/actions/payments";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export type PaymentCardItem = {
  id: string;
  client_id: string;
  amount: number;
  paid_at: string | null;
  payment_method?: string | null;
  clients: { full_name: string; email?: string | null; avatar_url?: string | null } | null;
};

interface PaymentCardsClientProps {
  payments: PaymentCardItem[];
}

export function PaymentCardsClient({
  payments: initialPayments,
}: PaymentCardsClientProps) {
  const [payments, setPayments] = useState(initialPayments);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await deletePayment(deleteId);
      if (result.success) {
        setPayments((prev) => prev.filter((p) => p.id !== deleteId));
        toast.success("Pago eliminado correctamente");
      } else {
        toast.error(result.error || "No se pudo eliminar el pago");
      }
    } catch {
      toast.error("No se pudo eliminar el pago. Intenta de nuevo.");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {payments.map((payment) => {
          const clientName =
            payment.clients?.full_name || "Cliente desconocido";
          const initials = clientName
            .split(/\s+/)
            .slice(0, 2)
            .map((n) => n[0])
            .join("")
            .toUpperCase();

          const menuSections: AdminCardMenuSection[] = [
            {
              items: [
                ...(payment.client_id
                  ? [
                      {
                        label: "Ver detalle",
                        icon: <Eye className="mr-2 size-4" />,
                        href: `/admin/clients/${payment.client_id}`,
                      },
                    ]
                  : []),
                {
                  label: "Editar",
                  icon: <Edit2 className="mr-2 size-4" />,
                  href: `/admin/payments/${payment.id}/edit`,
                },
              ],
            },
            {
              separatorBefore: true,
              items: [
                {
                  label: "Eliminar",
                  icon: <Trash2 className="mr-2 size-4" />,
                  onClick: () => setDeleteId(payment.id),
                  variant: "destructive" as const,
                },
              ],
            },
          ];

          console.log("Avatar URL in client:", payment.clients?.avatar_url, "Full name:", clientName);

          return (
            <AdminCardWithActions key={payment.id} menuSections={menuSections} className="overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
              <AdminCardHeaderWithActions menuSections={menuSections}>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-full border border-border shadow-sm">
                    {payment.clients?.avatar_url && (
                      <AvatarImage
                        src={payment.clients.avatar_url}
                        alt={clientName}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {initials || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold tracking-tight truncate text-foreground leading-tight">
                      {clientName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-medium">
                      {payment.paid_at
                        ? format(new Date(payment.paid_at), "d MMM yyyy", {
                            locale: es,
                          })
                        : "Pendiente"}
                      {payment.payment_method && ` • ${payment.payment_method}`}
                    </p>
                  </div>
                </div>
              </AdminCardHeaderWithActions>
              <div className="px-4 pb-4">
                <div className="flex flex-row items-center justify-between bg-muted/30 border border-border/50 rounded-lg p-2.5 px-3">
                  <Badge
                    variant="outline"
                    className={
                      payment.paid_at
                        ? "border-success/30 bg-success/15 text-success text-[10px] uppercase font-bold tracking-wider rounded-md py-0.5 px-1.5"
                        : "border-warning/35 bg-warning/12 text-warning-foreground text-[10px] uppercase font-bold tracking-wider rounded-md py-0.5 px-1.5"
                    }
                  >
                    {payment.paid_at ? "Pagado" : "Pendiente"}
                  </Badge>
                  <div className="flex flex-row items-baseline gap-1.5">
                    <span className="text-base font-black tabular-nums tracking-tight text-foreground">
                      ${payment.amount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </AdminCardWithActions>
          );
        })}
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro del pago será
              eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
