'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'
import { deleteRoutine } from '@/app/actions/routine-builder'
import { toast } from 'sonner'

interface DeleteRoutineButtonProps {
  routineId: string
  routineName: string
}

export function DeleteRoutineButton({ routineId, routineName }: DeleteRoutineButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteRoutine(routineId)
      if (result.success) {
        toast.success('Rutina eliminada correctamente')
        setOpen(false)
        router.push('/admin/routines')
        router.refresh()
      } else {
        toast.error(result.error || 'No se pudo eliminar la rutina')
      }
    } catch {
      toast.error('No se pudo eliminar la rutina. Intenta de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar rutina?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará &quot;{routineName}&quot; y todos sus días y ejercicios. Esta acción no se
            puede deshacer. Si la rutina está asignada a clientes, la asignación también se
            eliminará.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
