"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Activity, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateLevel } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { ProfileAvatarSection } from "@/components/profile/profile-avatar-section";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";

interface Profile {
  id: string;
  username?: string;
  avatar_url?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  birth_date?: string;
  fitness_goal?: string;
  experience_level?: string;
  xp_points?: number;
  level?: number;
  streak_days?: number;
}

export function UserProfileContent({
  initialProfile,
  userId,
  userEmail,
  clientId,
}: {
  initialProfile: Profile;
  userId: string;
  userEmail: string;
  clientId?: string;
}) {
  const [profile, setProfile] = useState<Profile>(initialProfile || {});
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const levelFromXp = calculateLevel(profile.xp_points ?? 0).level;

  const [painRegion, setPainRegion] = useState<string>("none");
  const [painSeverity, setPainSeverity] = useState<number>(0);
  const [painNotes, setPainNotes] = useState<string>("");
  const [painSaving, setPainSaving] = useState(false);
  const [activePainReports, setActivePainReports] = useState<
    {
      id: string;
      body_region: string;
      severity: number;
      notes: string | null;
      reported_at: string;
    }[]
  >([]);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("client_pain_reports")
        .select("id, body_region, severity, notes, reported_at")
        .eq("client_id", clientId)
        .eq("is_active", true)
        .order("reported_at", { ascending: false });

      if (cancelled) return;
      if (error) return;
      setActivePainReports((data ?? []) as any);
    })();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const handleSaveProfile = async () => {
    if (!profile.full_name?.trim()) {
      toast.error("El nombre completo es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      // Normalizamos valores: si es string vacío, enviamos null para evitar violaciones de CHECK constraints
      const profilePayload = {
        username: profile.username?.trim() || null,
        full_name: profile.full_name.trim(),
        phone: profile.phone?.trim() || null,
        gender:
          profile.gender && profile.gender !== "none" ? profile.gender : null,
        birth_date: profile.birth_date || null,
        fitness_goal: profile.fitness_goal || null,
        experience_level: profile.experience_level || null,
      };

      const { error } = await supabase
        .from("profiles")
        .update(profilePayload)
        .eq("id", userId);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("No pudimos guardar. Intenta de nuevo.");
        return;
      }

      if (clientId) {
        // También normalizamos para la tabla de clientes si existe
        await supabase
          .from("clients")
          .update({
            full_name: profile.full_name.trim(),
            phone: profile.phone?.trim() || "",
            gender:
              profile.gender && profile.gender !== "none"
                ? profile.gender
                : null,
            birth_date: profile.birth_date || null,
          })
          .eq("id", clientId);
      }

      toast.success("¡Perfil actualizado!");
    } catch (err) {
      console.error("Error in handleSaveProfile:", err);
      toast.error("No pudimos guardar el perfil. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePainReport = async () => {
    if (!clientId) return;
    if (painRegion === "none") {
      toast.error("Selecciona una zona");
      return;
    }

    setPainSaving(true);
    try {
      const { data, error } = await supabase
        .from("client_pain_reports")
        .insert({
          client_id: clientId,
          body_region: painRegion,
          severity: painSeverity,
          notes: painNotes || null,
          is_active: true,
        })
        .select("id, body_region, severity, notes, reported_at")
        .single();

      if (error) {
        toast.error("No pudimos guardar tu reporte. Intenta de nuevo.");
        return;
      }

      setActivePainReports((prev) => [data as any, ...prev]);
      setPainRegion("none");
      setPainSeverity(0);
      setPainNotes("");
      toast.success("Reporte guardado");
    } finally {
      setPainSaving(false);
    }
  };

  const handleResolvePainReport = async (id: string) => {
    if (!clientId) return;
    const { error } = await supabase
      .from("client_pain_reports")
      .update({ is_active: false })
      .eq("id", id)
      .eq("client_id", clientId);

    if (error) {
      toast.error("No pudimos actualizar el reporte.");
      return;
    }

    setActivePainReports((prev) => prev.filter((r) => r.id !== id));
    toast.success("Reporte marcado como resuelto");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <aside className="flex flex-col gap-6 lg:col-span-4 lg:sticky lg:top-[max(1rem,env(safe-area-inset-top))] lg:self-start">
        <ProfileAvatarSection
          userId={userId}
          initialUrl={profile.avatar_url}
          onAvatarUrlChange={(avatar_url) =>
            setProfile((p) => ({ ...p, avatar_url }))
          }
          description="Recomendado: foto cuadrada y buena luz. JPG, PNG o WebP · máx. 2 MB."
        />

        {/* Stats */}
        {profile.xp_points !== undefined && (
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Nivel</p>
                  <p className="text-3xl font-bold text-primary">
                    {levelFromXp}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Experiencia</p>
                  <p className="text-3xl font-bold text-primary">
                    {profile.xp_points || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Racha</p>
                  <p className="text-3xl font-bold text-primary">
                    {profile.streak_days || 0} días
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </aside>

      <section className="flex flex-col gap-6 lg:col-span-8">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input value={userEmail} disabled className="bg-muted" />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Usuario</FieldLabel>
                  <Input
                    value={profile.username || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, username: e.target.value })
                    }
                    placeholder="Tu usuario"
                  />
                </Field>
                <Field>
                  <FieldLabel>Nombre completo</FieldLabel>
                  <Input
                    value={profile.full_name || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, full_name: e.target.value })
                    }
                    placeholder="Tu nombre"
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Teléfono</FieldLabel>
                  <Input
                    value={profile.phone || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    placeholder="Tu número"
                  />
                </Field>

                <Field>
                  <FieldLabel>Fecha de nacimiento</FieldLabel>
                  <DatePicker
                    date={
                      profile.birth_date
                        ? new Date(profile.birth_date)
                        : undefined
                    }
                    setDate={(date) =>
                      setProfile({
                        ...profile,
                        birth_date: date
                          ? date.toISOString().split("T")[0]
                          : undefined,
                      })
                    }
                    placeholder="Tu fecha"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>Género</FieldLabel>
                <Select
                  value={profile.gender || ""}
                  onValueChange={(value) =>
                    setProfile({ ...profile, gender: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" disabled className="hidden">
                      Seleccionar
                    </SelectItem>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Femenino</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Fitness Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil de fitness</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Objetivo</FieldLabel>
                  <Select
                    value={profile.fitness_goal || ""}
                    onValueChange={(value) =>
                      setProfile({ ...profile, fitness_goal: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose_weight">Perder peso</SelectItem>
                      <SelectItem value="gain_muscle">Ganar músculo</SelectItem>
                      <SelectItem value="maintain">Mantener</SelectItem>
                      <SelectItem value="strength">Fuerza</SelectItem>
                      <SelectItem value="endurance">Resistencia</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Experiencia</FieldLabel>
                  <Select
                    value={profile.experience_level || ""}
                    onValueChange={(value) =>
                      setProfile({ ...profile, experience_level: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Sticky Mobile Save Action for Profile info */}
        <div className="sticky bottom-0 z-10 -mx-6 -mt-2 border-t bg-background/80 p-6 backdrop-blur-md md:static md:mx-0 md:mt-0 md:bg-transparent md:p-0 md:pt-2 md:border-none">
          <Button
            onClick={handleSaveProfile}
            size="lg"
            className="w-full gap-2 sm:w-auto"
            disabled={saving}
          >
            {saving ? "Guardando…" : "Guardar cambios de perfil"}
          </Button>
        </div>

        {/* Pain / Injury Intake */}
        {clientId ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="size-4 text-primary" aria-hidden />
                Dolor / lesión
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-xl border border-border/60 bg-muted/15 p-4 text-sm text-muted-foreground">
                Sirve para que tu coach y la app ajusten la progresión: si hay
                dolor activo, evitamos subidas agresivas de carga y priorizamos
                continuidad y seguridad.
              </div>

              <FieldGroup>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>Zona</FieldLabel>
                    <Select value={painRegion} onValueChange={setPainRegion}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una zona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Selecciona…</SelectItem>
                        <SelectItem value="hombro">Hombro</SelectItem>
                        <SelectItem value="codo">Codo</SelectItem>
                        <SelectItem value="muñeca">Muñeca</SelectItem>
                        <SelectItem value="espalda_baja">Espalda baja</SelectItem>
                        <SelectItem value="rodilla">Rodilla</SelectItem>
                        <SelectItem value="cadera">Cadera</SelectItem>
                        <SelectItem value="tobillo">Tobillo</SelectItem>
                        <SelectItem value="cuello">Cuello</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>Severidad (0-10)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={painSeverity}
                      onChange={(e) =>
                        setPainSeverity(
                          Math.max(0, Math.min(10, Number(e.target.value) || 0)),
                        )
                      }
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Notas</FieldLabel>
                  <Textarea
                    value={painNotes}
                    onChange={(e) => setPainNotes(e.target.value)}
                    placeholder="¿Qué sientes? ¿Cuándo aparece? ¿Qué lo empeora/mejora?"
                  />
                </Field>

                <Button
                  onClick={handleSavePainReport}
                  disabled={painSaving}
                  className="w-full"
                >
                  {painSaving ? "Guardando…" : "Guardar reporte"}
                </Button>
              </FieldGroup>

              {activePainReports.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Reportes activos</div>
                  <div className="flex flex-col gap-2">
                    {activePainReports.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-start justify-between gap-3 rounded-lg border bg-muted/20 p-3 text-sm"
                      >
                        <div className="min-w-0">
                          <div className="font-medium">
                            {r.body_region} · {r.severity}/10
                          </div>
                          {r.notes ? (
                            <div className="text-muted-foreground mt-1 text-pretty">
                              {r.notes}
                            </div>
                          ) : null}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolvePainReport(r.id)}
                        >
                          Resuelto
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Sin reportes activos. Si sientes dolor, regístralo aquí para
                  que tu coach lo tome en cuenta.
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
