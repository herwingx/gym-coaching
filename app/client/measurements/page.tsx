import { getAuthUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Ruler, Scale, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MeasurementsChartLazy } from "@/components/charts/measurements-chart-lazy";
import { MeasurementsRadarChartLazy } from "@/components/charts/measurements-radar-chart-lazy";
import { AddMeasurementForm } from "./add-measurement-form";
import {
  CLIENT_DATA_PAGE_SHELL,
  ClientIncompleteProfileCard,
  ClientStackPageHeader,
} from "@/components/client/client-app-page-parts";

type MeasurementRow = {
  id: string;
  recorded_at: string;
  weight: number | null;
  waist_cm: number | null;
  body_fat_pct: number | null;
};

export default async function ClientMeasurementsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();
  const { data: clientRecord } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!clientRecord) {
    return (
      <>
        <ClientStackPageHeader
          title="Medidas"
          subtitle="Completa tu perfil para registrar peso, cintura y composición."
        />
        <div className={CLIENT_DATA_PAGE_SHELL}>
          <ClientIncompleteProfileCard />
        </div>
      </>
    );
  }

  const measurementsRes = await supabase
    .from("body_measurements")
    .select("id, recorded_at, weight, waist_cm, body_fat_pct")
    .eq("client_id", clientRecord.id)
    .order("recorded_at", { ascending: true })
    .limit(120);

  const measurements = (measurementsRes.data || []) as MeasurementRow[];
  const latest =
    measurements.length > 0 ? measurements[measurements.length - 1] : null;
  const n = measurements.length;
  const measurementsSubtitle =
    n === 0
      ? "Sin registros · añade la primera medida para ver la evolución."
      : `${n} ${n === 1 ? "registro" : "registros"} · peso, cintura y composición.`;

  return (
    <>
      <ClientStackPageHeader title="Medidas" subtitle={measurementsSubtitle} />

      <div
        className={`${CLIENT_DATA_PAGE_SHELL} grid gap-6 lg:grid-cols-12 lg:items-start`}
      >
        <aside className="flex flex-col gap-6 lg:col-span-4 lg:sticky lg:top-[max(1rem,env(safe-area-inset-top))] lg:self-start">
          <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
            <CardHeader className="flex flex-col gap-4 pb-4">
              <div className="flex items-start gap-3 text-center sm:min-w-0 sm:flex-1 sm:text-left">
                <div className="mx-auto flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted sm:mx-0">
                  <Scale className="size-4 text-primary" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg">
                    Resumen
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Último registro y acceso rápido para anotar nuevas medidas
                  </CardDescription>
                </div>
              </div>
              <div className="flex justify-center sm:justify-start">
                <AddMeasurementForm />
              </div>
            </CardHeader>
            <CardContent>
              {!latest ? (
                <div className="rounded-xl border border-border/60 bg-muted/15 px-4 py-8 text-center sm:px-6 sm:text-left">
                  <p className="text-sm font-medium text-foreground">
                    Aún no tienes medidas registradas
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground text-pretty">
                    Usa <span className="font-medium">Registrar medida</span>{" "}
                    para guardar tu primera toma. Podrás ver gráficos cuando
                    tengas al menos dos fechas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 border-t border-border/60 pt-6 text-center sm:grid-cols-1 sm:text-left">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Peso
                    </p>
                    <p className="text-2xl font-bold tabular-nums sm:text-3xl">
                      {latest.weight ?? "—"} kg
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {new Date(latest.recorded_at).toLocaleDateString("es", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Cintura
                    </p>
                    <p className="text-2xl font-bold tabular-nums sm:text-3xl">
                      {latest.waist_cm ?? "—"} cm
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Grasa corporal
                    </p>
                    <p className="text-2xl font-bold tabular-nums sm:text-3xl">
                      {latest.body_fat_pct != null
                        ? `${latest.body_fat_pct}%`
                        : "—"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        <section className="min-w-0 lg:col-span-8">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Ruler className="size-4 text-primary" aria-hidden />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">
                      Evolución
                    </CardTitle>
                    <CardDescription>
                      Elige la métrica para ver la tendencia en el tiempo
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MeasurementsChartLazy
                  measurements={measurements.map((m) => ({
                    recorded_at: m.recorded_at,
                    weight: m.weight,
                    waist_cm: m.waist_cm,
                    body_fat_pct: m.body_fat_pct,
                  }))}
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Sparkles className="size-4 text-primary" aria-hidden />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">
                      Radar
                    </CardTitle>
                    <CardDescription>
                      Últimos registros para ver cambios de un vistazo
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MeasurementsRadarChartLazy
                  measurements={measurements.map((m) => ({
                    recorded_at: m.recorded_at,
                    weight: m.weight,
                    waist_cm: m.waist_cm,
                    body_fat_pct: m.body_fat_pct,
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
