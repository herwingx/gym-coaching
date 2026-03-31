"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldGroup, Field } from "@/components/ui/field";
import Link from "next/link";
import { createNewRoutine } from "@/app/actions/routines";
import { toast } from "sonner";

export function NewRoutineForm() {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [level, setLevel] = React.useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    formData.set("level", level);

    try {
      await createNewRoutine(formData);
      toast.success("¡Rutina creada correctamente!");
    } catch (error) {
      toast.error("No pudimos crear la rutina. Intenta de nuevo.");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Rutina</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <Field>
              <Label htmlFor="name">Nombre de la Rutina *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Full Body Principiante"
                required
              />
            </Field>

            <Field>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe los objetivos y características de esta rutina..."
                rows={3}
              />
            </Field>

            <Field>
              <Label htmlFor="goal">Objetivo</Label>
              <Input
                id="goal"
                name="goal"
                placeholder="Ej: Pérdida de peso, Ganancia muscular, etc."
              />
            </Field>

            <div className="grid md:grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="level">Nivel</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Principiante</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <Label htmlFor="daysPerWeek">Días por Semana</Label>
                <Input
                  id="daysPerWeek"
                  name="daysPerWeek"
                  type="number"
                  placeholder="3"
                  min="1"
                  max="7"
                />
              </Field>
            </div>

            <Field>
              <Label htmlFor="durationWeeks">Duración (semanas)</Label>
              <Input
                id="durationWeeks"
                name="durationWeeks"
                type="number"
                placeholder="4"
                min="1"
                max="52"
              />
            </Field>
          </FieldGroup>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Creando..." : "Crear Rutina"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isPending}
              asChild
            >
              <Link href="/admin/routines">Cancelar</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
