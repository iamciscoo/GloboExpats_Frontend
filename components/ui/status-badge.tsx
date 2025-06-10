import { Badge } from "@/components/ui/badge"
import { getStatusColor } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  variant?: "default" | "outline"
  className?: string
}

export function StatusBadge({ status, variant = "outline", className }: StatusBadgeProps) {
  return (
    <Badge 
      variant={variant} 
      className={cn(getStatusColor(status), className)}
    >
      {status}
    </Badge>
  )
} 