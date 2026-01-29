// =============================================================================
// Priority Badge Component
// =============================================================================

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PriorityColors } from "@/types/api";

interface PriorityBadgeProps {
  priority: string | null;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const priorityKey = priority || "None";
  const colorClass = PriorityColors[priorityKey] || PriorityColors.None;
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        colorClass,
        className
      )}
    >
      {priorityKey}
    </Badge>
  );
}
