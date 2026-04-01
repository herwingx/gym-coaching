'use client'

import { Badge } from '@/components/ui/badge'

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Activo',
    className: 'border-success/30 bg-success/15 text-success hover:bg-success/20',
  },
  expired: {
    label: 'Vencido',
    className: 'border-destructive/35 bg-destructive/10 text-destructive',
  },
  suspended: {
    label: 'Suspendido',
    className: 'border-amber-500/50 text-amber-800 bg-amber-500/10 dark:text-amber-400',
  },
  inactive: {
    label: 'Inactivo',
    className: 'border-muted-foreground/25 bg-muted text-muted-foreground',
  },
  pending: {
    label: 'Pendiente',
    className: 'border-primary/50 bg-primary/10 text-primary',
  },
  pending_payment: {
    label: 'Pendiente de pago',
    className: 'border-amber-500/50 bg-amber-500/10 text-amber-500',
  },
  expiring_soon: {
    label: 'Por vencer',
    className: 'border-amber-500/50 text-amber-800 bg-amber-500/10 dark:text-amber-400',
  },
  paused: {
    label: 'Pausado',
    className: 'border-muted-foreground/35 bg-muted/80 text-muted-foreground',
  },
}

/**
 * Badge de estado de cliente para vistas admin — mismos colores en gestión, ficha y listados.
 */
export function AdminClientStatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase()
  const cfg = STATUS_STYLE[key] ?? {
    label: status.replace(/_/g, ' '),
    className: 'border-border bg-muted/50 text-foreground capitalize',
  }
  return (
    <Badge variant="outline" className={`font-medium ${cfg.className}`}>
      {cfg.label}
    </Badge>
  )
}
