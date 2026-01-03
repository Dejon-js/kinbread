import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CapacityBadgeProps {
  used: number;
  total: number;
  showFraction?: boolean;
}

export function CapacityBadge({ used, total, showFraction = true }: CapacityBadgeProps) {
  const available = total - used;
  const isFull = available <= 0;
  const isOverCapacity = used > total;
  const isNearFull = !isFull && available <= 1;

  let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "secondary";
  let label = showFraction ? `${used}/${total}` : `${available} left`;

  if (isOverCapacity) {
    variant = "destructive";
    label = showFraction ? `${used}/${total} (over)` : "Over capacity";
  } else if (isFull) {
    variant = "destructive";
    label = showFraction ? `${used}/${total}` : "Sold out";
  } else if (isNearFull) {
    variant = "warning";
    label = showFraction ? `${used}/${total}` : `${available} left`;
  } else if (used === 0) {
    variant = "success";
    label = showFraction ? `0/${total}` : `${total} available`;
  }

  return (
    <Badge variant={variant} className={cn("font-mono text-xs")}>
      {label}
    </Badge>
  );
}
