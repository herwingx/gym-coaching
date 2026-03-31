"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface AccessCodeBannerProps {
  code: string;
  clientEmail?: string | null;
  emailSent?: boolean;
  emailFailed?: boolean;
}

export function AccessCodeBanner({
  code,
  clientEmail,
  emailSent,
  emailFailed,
}: AccessCodeBannerProps) {
  const [copied, setCopied] = useState(false);

  const signUpUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/sign-up?code=${code}`
      : "";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("¡Código copiado! Pégalo donde lo necesites.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(signUpUrl);
    toast.success("¡Enlace copiado! Compártelo con tu asesorado.");
  };

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          Código de acceso para el asesorado
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {emailSent && clientEmail ? (
            <>
              Correo enviado a <strong>{clientEmail}</strong>. El asesorado
              puede usar el código para registrarse y crear su usuario +
              contraseña.
            </>
          ) : emailFailed && clientEmail ? (
            <>
              No se pudo enviar el correo. Comparte el código manualmente con{" "}
              <strong>{clientEmail}</strong>.
            </>
          ) : (
            <>
              Comparte este código con{" "}
              <strong>{clientEmail || "tu asesorado"}</strong> para que pueda
              crear su cuenta (usuario y contraseña) e iniciar sesión.
            </>
          )}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3">
            <span className="font-mono text-xl font-bold tracking-widest">
              {code}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyCode}
              className="h-8 w-8 shrink-0"
            >
              {copied ? (
                <Check className="size-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar enlace
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`/auth/sign-up?code=${code}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir registro
            </a>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          El asesorado va a Registrarse, ingresa el código y crea su usuario
          (email) y contraseña. El código solo valida que está invitado; no
          sustituye el login. Expira en 30 días.
        </p>
      </CardContent>
    </Card>
  );
}
