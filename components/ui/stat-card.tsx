"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  variant?: "default" | "primary" | "gradient"
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "gradient" && "bg-primary text-primary-foreground",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className={cn(
              "text-sm font-medium",
              variant === "default" ? "text-muted-foreground" : "opacity-80"
            )}>
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className={cn(
                "text-xs",
                variant === "default" ? "text-muted-foreground" : "opacity-70"
              )}>
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 pt-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.value >= 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.value >= 0 ? "+" : ""}{trend.value}%
                </span>
                <span className={cn(
                  "text-xs",
                  variant === "default" ? "text-muted-foreground" : "opacity-70"
                )}>
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "rounded-full p-3",
              variant === "default" ? "bg-muted" : "bg-black/10"
            )}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
