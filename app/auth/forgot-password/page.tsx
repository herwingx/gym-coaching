"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

function getRedirectUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`;
  }
  return process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    : "http://localhost:3000/auth/callback";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl(),
      });

      if (error) throw error;
      setSent(true);
      toast.success(
        "Revisa tu correo. Te enviamos un enlace para restablecer tu contraseña.",
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "";
      const isRateLimit =
        msg.toLowerCase().includes("rate limit") || msg.includes("429");
      toast.error(
        isRateLimit
          ? "Demasiados intentos. Espera un minuto e intenta de nuevo."
          : "No pudimos enviar el correo. Revisa el correo e intenta de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md overflow-hidden">
              <img
                src="/android-chrome-512x512.png"
                alt="Logo RU Coach"
                className="size-full"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black tracking-tighter uppercase">
                RU Coach
              </span>
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                Rodrigo Urbina
              </span>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
                <h1 className="text-2xl font-bold tracking-tight">
                  {sent ? "Revisa tu correo" : "¿Olvidaste tu contraseña?"}
                </h1>
                <p className="text-sm text-balance text-muted-foreground">
                  {sent
                    ? "Te hemos enviado un enlace para restablecer tu contraseña. Revisa también la carpeta de spam."
                    : "Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña."}
                </p>
              </div>

              {!sent ? (
                <form onSubmit={handleSubmit}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="tu@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </Field>
                    <Field>
                      <Button
                        type="submit"
                        className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer transition-all duration-200"
                        disabled={isLoading}
                      >
                        {isLoading ? "Enviando..." : "Enviar enlace"}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              ) : (
                <Button variant="outline" className="w-full h-11" asChild>
                  <Link href="/auth/login">
                    <ArrowLeft className="size-4 mr-2" />
                    Volver al inicio de sesión
                  </Link>
                </Button>
              )}

              {!sent && (
                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                  >
                    Volver al inicio de sesión
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center md:justify-start">
          <ThemeToggle />
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/img-login.jpg"
          alt="RU Coach Training"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] dark:grayscale-[0.2] transition-all duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent lg:from-background/20" />
      </div>
    </div>
  );
}
