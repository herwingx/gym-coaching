"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { addMeasurement } from "@/app/actions/measurements";

export function AddMeasurementForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [chest, setChest] = useState("");
  const [arm, setArm] = useState("");
  const [thigh, setThigh] = useState("");

  const parseFiniteNumberOrUndefined = (raw: string) => {
    if (!raw) return undefined;
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFiniteNumberOrUndefined(weight);
    const bf = parseFiniteNumberOrUndefined(bodyFat);
    const wc = parseFiniteNumberOrUndefined(waist);
    const h = parseFiniteNumberOrUndefined(hip);
    const c = parseFiniteNumberOrUndefined(chest);
    const a = parseFiniteNumberOrUndefined(arm);
    const t = parseFiniteNumberOrUndefined(thigh);

    if (
      w == null &&
      bf == null &&
      wc == null &&
      h == null &&
      c == null &&
      a == null &&
      t == null
    ) {
      toast.error("Ingresa al menos una medida (peso, grasa, cintura, etc.)");
      return;
    }

    setLoading(true);
    let result: Awaited<ReturnType<typeof addMeasurement>>;
    try {
      result = await addMeasurement({
        weight: w,
        body_fat_pct: bf,
        waist_cm: wc,
        hip_cm: h,
        chest_cm: c,
        arm_cm: a,
        thigh_cm: t,
      });
    } catch (e) {
      console.error(e);
      toast.error("Error inesperado al guardar. Intenta de nuevo.");
      return;
    } finally {
      setLoading(false);
    }

    if (result.success) {
      toast.success("¡Medida registrada correctamente!");
      setOpen(false);
      setWeight("");
      setBodyFat("");
      setWaist("");
      setHip("");
      setChest("");
      setArm("");
      setThigh("");
      router.refresh();
    } else {
      toast.error(
        result.error || "No pudimos registrar la medida. Intenta de nuevo.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="min-h-11 gap-2 sm:min-h-9">
          <Plus data-icon="inline-start" />
          Registrar medida
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar medida</DialogTitle>
          <DialogDescription>
            Ingresa las medidas que quieras registrar. Solo son obligatorias las
            que completes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="body_fat">% Grasa</Label>
              <Input
                id="body_fat"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="20"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="waist">Cintura (cm)</Label>
              <Input
                id="waist"
                type="number"
                step="0.1"
                min="0"
                placeholder="80"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hip">Cadera (cm)</Label>
              <Input
                id="hip"
                type="number"
                step="0.1"
                min="0"
                placeholder="95"
                value={hip}
                onChange={(e) => setHip(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="chest">Pecho (cm)</Label>
              <Input
                id="chest"
                type="number"
                step="0.1"
                min="0"
                placeholder="100"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="arm">Brazo (cm)</Label>
              <Input
                id="arm"
                type="number"
                step="0.1"
                min="0"
                placeholder="35"
                value={arm}
                onChange={(e) => setArm(e.target.value)}
              />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="thigh">Muslo (cm)</Label>
              <Input
                id="thigh"
                type="number"
                step="0.1"
                min="0"
                placeholder="55"
                value={thigh}
                onChange={(e) => setThigh(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
