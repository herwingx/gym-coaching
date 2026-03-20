'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { addMeasurement } from '@/app/actions/measurements'

export function AddMeasurementForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [chest, setChest] = useState('')
  const [arm, setArm] = useState('')
  const [thigh, setThigh] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const w = weight ? parseFloat(weight) : undefined
    const bf = bodyFat ? parseFloat(bodyFat) : undefined
    const wc = waist ? parseFloat(waist) : undefined
    const h = hip ? parseFloat(hip) : undefined
    const c = chest ? parseFloat(chest) : undefined
    const a = arm ? parseFloat(arm) : undefined
    const t = thigh ? parseFloat(thigh) : undefined

    if (!w && !bf && !wc && !h && !c && !a && !t) {
      toast.error('Ingresa al menos una medida (peso, grasa, cintura, etc.)')
      return
    }

    setLoading(true)
    const result = await addMeasurement({
      weight: w,
      body_fat_pct: bf,
      waist_cm: wc,
      hip_cm: h,
      chest_cm: c,
      arm_cm: a,
      thigh_cm: t,
    })

    setLoading(false)
    if (result.success) {
      toast.success('¡Medida registrada correctamente!')
      setOpen(false)
      setWeight('')
      setBodyFat('')
      setWaist('')
      setHip('')
      setChest('')
      setArm('')
      setThigh('')
      router.refresh()
    } else {
      toast.error('No pudimos registrar la medida. Intenta de nuevo.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          Registrar medida
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar medida</DialogTitle>
          <DialogDescription>
            Ingresa las medidas que quieras registrar. Solo son obligatorias las que completes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2 col-span-2">
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
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
