"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { unstable_rethrow } from "next/navigation";
import { createNewClient } from "@/app/actions/clients";
import { toast } from "sonner";

const GOALS = [
  { value: "muscle_gain", label: "Ganar masa muscular" },
  { value: "fat_loss", label: "Pérdida de grasa" },
  { value: "strength", label: "Fuerza" },
  { value: "endurance", label: "Resistencia" },
  { value: "general_fitness", label: "Bienestar general" },
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
];

export function NewClientForm() {
  const [isPending, setIsPending] = useState(false);
  const [gender, setGender] = useState("");
  const [goal, setGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [birthDate, setBirthDate] = useState<Date>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    formData.set("gender", gender);
    formData.set("goal", goal);
    formData.set("experienceLevel", experienceLevel);
    if (birthDate) {
      formData.set("birthDate", birthDate.toISOString().split("T")[0]);
    }

    try {
      await createNewClient(formData);
      toast.success("¡Asesorado creado correctamente!");
    } catch (error) {
      unstable_rethrow(error);
      toast.error(
        "No pudimos crear el asesorado. Revisa los datos e intenta de nuevo.",
      );
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del asesorado</CardTitle>
        <p className="text-sm text-muted-foreground">
          Completa los datos básicos. Podrás editar objetivos y plan después.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="fullName">Nombre completo *</FieldLabel>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Juan Pérez"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email *</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="juan@example.com"
                  required
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                <Input id="phone" name="phone" placeholder="+34 612 345 678" />
              </Field>
              <Field>
                <FieldLabel>Fecha de nacimiento</FieldLabel>
                <DatePicker date={birthDate} setDate={setBirthDate} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="gender">Género</FieldLabel>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Femenino</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="goal">Objetivo</FieldLabel>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger id="goal" className="w-full">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="experienceLevel">
                Nivel de experiencia
              </FieldLabel>
              <Select
                value={experienceLevel}
                onValueChange={setExperienceLevel}
              >
                <SelectTrigger
                  id="experienceLevel"
                  className="w-full md:max-w-xs"
                >
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Notas</FieldLabel>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Observaciones, lesiones, preferencias..."
                rows={4}
                className="min-h-[100px] resize-y"
              />
            </Field>
          </FieldGroup>

          <div className="flex gap-4 pt-2">
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Creando..." : "Crear asesorado"}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              disabled={isPending}
            >
              <Link href="/admin/clients">Cancelar</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
