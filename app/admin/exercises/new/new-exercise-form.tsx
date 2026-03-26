'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createAdminExercise } from '@/app/actions/exercises'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const PRIMARY_MUSCLES = [
  { value: 'chest', label: 'Pecho' },
  { value: 'back', label: 'Espalda' },
  { value: 'shoulders', label: 'Hombros' },
  { value: 'biceps', label: 'Bíceps' },
  { value: 'triceps', label: 'Tríceps' },
  { value: 'abs', label: 'Abdomen' },
  { value: 'glutes', label: 'Glúteos' },
  { value: 'quadriceps', label: 'Cuádriceps' },
  { value: 'hamstrings', label: 'Isquiotibiales' },
  { value: 'calves', label: 'Gemelos' },
  { value: 'forearms', label: 'Antebrazos' },
  { value: 'full_body', label: 'Cuerpo completo' },
  { value: 'cardio', label: 'Cardio' },
] as const

const EXERCISE_TYPES = [
  { value: 'strength', label: 'Fuerza / hipertrofia' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'mobility', label: 'Movilidad' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'stretching', label: 'Estiramiento' },
] as const

export function NewExerciseForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [primaryMuscle, setPrimaryMuscle] = useState<string>('chest')
  const [exerciseType, setExerciseType] = useState<string>('strength')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    try {
      const fd = new FormData(e.currentTarget)
      fd.set('primaryMuscle', primaryMuscle)
      fd.set('exerciseType', exerciseType)
      await createAdminExercise(fd)
      toast.success('Ejercicio creado')
      router.push('/admin/exercises')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo crear')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="ex-name">Nombre</FieldLabel>
          <FieldDescription>Como lo verán en rutinas y en la app del asesorado.</FieldDescription>
          <FieldContent>
            <Input id="ex-name" name="name" required className="rounded-xl" placeholder="Ej. Press inclinado con mancuernas" />
          </FieldContent>
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel id="ex-pm-label">Grupo principal</FieldLabel>
            <FieldDescription>Debe coincidir con la categoría en base de datos.</FieldDescription>
            <FieldContent>
              <Select value={primaryMuscle} onValueChange={setPrimaryMuscle}>
                <SelectTrigger className="w-full rounded-xl" aria-labelledby="ex-pm-label">
                  <SelectValue placeholder="Elige" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PRIMARY_MUSCLES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel id="ex-type-label">Tipo</FieldLabel>
            <FieldContent>
              <Select value={exerciseType} onValueChange={setExerciseType}>
                <SelectTrigger className="w-full rounded-xl" aria-labelledby="ex-type-label">
                  <SelectValue placeholder="Elige" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {EXERCISE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="ex-sec">Músculo secundario (opcional)</FieldLabel>
          <FieldContent>
            <Input id="ex-sec" name="secondaryMuscle" className="rounded-xl" placeholder="Ej. triceps" />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="ex-eq">Equipamiento (opcional)</FieldLabel>
          <FieldContent>
            <Input id="ex-eq" name="equipment" className="rounded-xl" placeholder="Ej. Mancuernas, Polea…" />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="ex-gif">URL del GIF (opcional)</FieldLabel>
          <FieldDescription>Enlace directo a imagen animada; se verá en la ficha como en el entreno.</FieldDescription>
          <FieldContent>
            <Input id="ex-gif" name="gifUrl" type="url" className="rounded-xl" placeholder="https://…" />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="ex-img">URL imagen estática (opcional)</FieldLabel>
          <FieldContent>
            <Input id="ex-img" name="imageUrl" type="url" className="rounded-xl" placeholder="https://…" />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="ex-video">URL de vídeo demo (opcional)</FieldLabel>
          <FieldContent>
            <Input id="ex-video" name="demoVideoUrl" type="url" className="rounded-xl" placeholder="YouTube o archivo…" />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="ex-notes">Técnica y notas</FieldLabel>
          <FieldDescription>Cues que quieras que lean coach antes de programar y el cliente en la ficha.</FieldDescription>
          <FieldContent>
            <Textarea
              id="ex-notes"
              name="techniqueNotes"
              className="min-h-28 rounded-xl"
              placeholder="Rango de movimiento, errores frecuentes, alternativas…"
            />
          </FieldContent>
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => router.back()} disabled={pending}>
          Cancelar
        </Button>
        <Button type="submit" className="rounded-xl" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="animate-spin" data-icon="inline-start" />
              Guardando…
            </>
          ) : (
            'Crear ejercicio'
          )}
        </Button>
      </div>
    </form>
  )
}
