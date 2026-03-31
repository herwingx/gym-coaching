"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
import { Copy, Power, Trash2 } from "lucide-react";
import {
  deactivateInvitationCode,
  deleteInvitationCode,
} from "@/app/actions/invitations";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export type InvitationCodeItem = {
  id: string;
  code: string;
  email: string | null;
  for_role: string;
  expires_at: string | null;
  times_used: number;
  max_uses: number;
  is_active: boolean;
};

interface InvitationCardsClientProps {
  codes: InvitationCodeItem[];
}

export function InvitationCardsClient({
  codes: initialCodes,
}: InvitationCardsClientProps) {
  const [codes, setCodes] = useState(initialCodes);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = (code: string) => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/sign-up?code=${code}`
        : "";
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success(
          "Enlace copiado. Compártelo por WhatsApp o como prefieras.",
        );
      })
      .catch(() => {
        toast.error("No pudimos copiar el enlace. Intenta de nuevo.");
      });
  };

  const handleDeactivate = async (codeId: string) => {
    const result = await deactivateInvitationCode(codeId);
    if (result && "success" in result && result.success) {
      setCodes((prev) =>
        prev.map((c) => (c.id === codeId ? { ...c, is_active: false } : c)),
      );
      toast.success("Código desactivado");
    } else {
      toast.error(
        result && "error" in result
          ? String(result.error)
          : "Error al desactivar",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    const result = await deleteInvitationCode(deleteId);
    if (result && "success" in result && result.success) {
      setCodes((prev) => prev.filter((c) => c.id !== deleteId));
      toast.success("Código eliminado");
      setDeleteId(null);
    } else {
      toast.error(
        result && "error" in result
          ? String(result.error)
          : "Error al eliminar",
      );
    }
    setIsDeleting(false);
  };

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {codes.map((code) => {
          const isExpired =
            code.expires_at && new Date(code.expires_at) < new Date();
          const isUsed = code.times_used >= code.max_uses;
          const isInactive = !code.is_active;
          const canDeactivate = !isInactive && !isUsed;
          const canDelete = isInactive && !isUsed;
          const hasMenu = canDeactivate || canDelete;

          const menuItems: AdminCardMenuSection["items"] = [];
          if (canDeactivate) {
            menuItems.push(
              {
                label: "Copiar",
                icon: <Copy className="mr-2 size-4" />,
                onClick: () => handleCopy(code.code),
              },
              {
                label: "Desactivar",
                icon: <Power className="mr-2 size-4" />,
                onClick: () => handleDeactivate(code.id),
              },
            );
          }
          if (canDelete) {
            menuItems.push({
              label: "Eliminar",
              icon: <Trash2 className="mr-2 size-4" />,
              onClick: () => setDeleteId(code.id),
              variant: "destructive",
            });
          }

          const menuSections: AdminCardMenuSection[] =
            menuItems.length > 0 ? [{ items: menuItems }] : [];

          const cardClassName = `group overflow-hidden transition-all hover:shadow-md hover:border-primary/30 rounded-xl ${
            isInactive || isExpired || isUsed ? "opacity-70" : ""
          }`;

          if (hasMenu) {
            return (
              <AdminCardWithActions
                key={code.id}
                menuSections={menuSections}
                cardClassName={cardClassName}
              >
                <AdminCardHeaderWithActions menuSections={menuSections}>
                  <div className="flex flex-col gap-2">
                    <code className="text-lg font-mono font-bold text-primary block truncate">
                      {code.code}
                    </code>
                    <div className="flex flex-wrap items-center gap-2">
                      {code.for_role === "admin" ? (
                        <Badge
                          variant="outline"
                          className="text-amber-600 border-amber-500/50"
                        >
                          Coach
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="font-normal">
                          Cliente
                        </Badge>
                      )}
                    </div>
                  </div>
                </AdminCardHeaderWithActions>
                <CardContent className="flex flex-col gap-2 p-4 pt-3">
                  <p className="text-sm text-muted-foreground truncate">
                    {code.email ? `Para: ${code.email}` : "Cualquier email"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expira:{" "}
                    {code.expires_at
                      ? format(new Date(code.expires_at), "d MMM yyyy", {
                          locale: es,
                        })
                      : "Nunca"}
                  </p>
                </CardContent>
              </AdminCardWithActions>
            );
          }

          return (
            <Card key={code.id} className={cardClassName}>
              <CardHeader className="p-4 pb-0">
                <div className="flex flex-col gap-2">
                  <code className="text-lg font-mono font-bold text-primary block truncate">
                    {code.code}
                  </code>
                  <div className="flex flex-wrap items-center gap-2">
                    {isUsed && (
                      <Badge
                        variant="outline"
                        className="bg-success/15 text-success border-success/30"
                      >
                        Usado
                      </Badge>
                    )}
                    {isExpired && !isUsed && (
                      <Badge
                        variant="outline"
                        className="bg-destructive/15 text-destructive border-destructive/30"
                      >
                        Expirado
                      </Badge>
                    )}
                    {isInactive && (
                      <Badge
                        variant="outline"
                        className="bg-muted-foreground/20 text-muted-foreground"
                      >
                        Desactivado
                      </Badge>
                    )}
                    {code.for_role === "admin" ? (
                      <Badge
                        variant="outline"
                        className="text-amber-600 border-amber-500/50"
                      >
                        Coach
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-normal">
                        Cliente
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 p-4 pt-3">
                <p className="text-sm text-muted-foreground truncate">
                  {code.email ? `Para: ${code.email}` : "Cualquier email"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Expira:{" "}
                  {code.expires_at
                    ? format(new Date(code.expires_at), "d MMM yyyy", {
                        locale: es,
                      })
                    : "Nunca"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar código de invitación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El código será eliminado
              permanentemente.
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
