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
          <Card className="overflow-hidden border-border/80 shadow-md ring-1 ring-primary/5 transition-all hover:shadow-lg">
            <CardHeader className="space-y-4 pb-6">
              <div className="flex items-center gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 transition-transform hover:scale-105">
                  <Scale className="size-5 text-primary" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg font-bold tracking-tight sm:text-xl">
                    Mis Medidas
                  </CardTitle>
                  <CardDescription className="text-sm font-medium leading-relaxed">
                    Registra y consulta tus datos antropométricos
                  </CardDescription>
                </div>
              </div>
              <AddMeasurementForm />
            </CardHeader>
            <CardContent className="space-y-6">
              {!latest ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-6 py-10 text-center">
                  <p className="text-base font-bold text-foreground">
                    Sin registros todavía
                  </p>
                  <p className="mt-2 text-sm font-medium text-muted-foreground text-pretty">
                    Anímate a registrar tu primera medida para comenzar a visualizar tu progreso.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 pt-2">
                  <div className="group relative overflow-hidden rounded-2xl border bg-muted/20 p-5 transition-all hover:bg-muted/30">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                        Peso Corporal
                      </p>
                      <Scale className="size-4 text-muted-foreground/40 group-hover:text-primary/40" />
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <p className="text-4xl font-black tabular-nums tracking-tighter text-foreground">
                        {latest.weight ?? "—"}<span className="text-lg font-bold text-muted-foreground ml-1">kg</span>
                      </p>
                    </div>
                    <p className="mt-2 text-[11px] font-bold text-muted-foreground/80">
                      📅 Actualizado el {new Date(latest.recorded_at).toLocaleDateString("es", {
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group rounded-2xl border bg-muted/20 p-5 transition-all hover:bg-muted/30">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                        Cintura
                      </p>
                      <p className="mt-2 text-2xl font-black tabular-nums tracking-tight text-foreground">
                        {latest.waist_cm ?? "—"}<span className="text-sm font-bold text-muted-foreground ml-1">cm</span>
                      </p>
                    </div>
                    <div className="group rounded-2xl border bg-muted/20 p-5 transition-all hover:bg-muted/30">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                        Grasa %
                      </p>
                      <p className="mt-2 text-2xl font-black tabular-nums tracking-tight text-foreground">
                        {latest.body_fat_pct != null
                          ? `${latest.body_fat_pct}%`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        <section className="min-w-0 lg:col-span-8 space-y-6">
          <div className="grid gap-6 xl:grid-cols-2 lg:items-start">
            <Card className="overflow-hidden border-border/80 shadow-md ring-1 ring-primary/5 rounded-3xl transition-all hover:shadow-lg">
              <CardHeader className="pb-4 pt-6 px-6 border-b bg-muted/5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Ruler className="size-5 text-primary" aria-hidden />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold tracking-tight">Evolución</CardTitle>
                    <CardDescription className="text-xs font-medium">Tendencia de tus medidas en el tiempo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
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

            <Card className="overflow-hidden border-border/80 shadow-md ring-1 ring-primary/5 rounded-3xl transition-all hover:shadow-lg">
              <CardHeader className="pb-4 pt-6 px-6 border-b bg-muted/5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Sparkles className="size-5 text-primary" aria-hidden />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold tracking-tight">Composición Radar</CardTitle>
                    <CardDescription className="text-xs font-medium">Balance actual de tus KPIs físicos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
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
