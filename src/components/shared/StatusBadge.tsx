// =============================================================================
// Status Badge Component
// =============================================================================

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Check, Clock } from "lucide-react";

interface StatusBadgeProps {
  isCompleted: boolean;
  className?: string;
}

export function StatusBadge({ isCompleted, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-medium",
        isCompleted
          ? "border-success/30 bg-success/10 text-success"
          : "border-warning/30 bg-warning/10 text-warning",
        className
      )}
    >
      {isCompleted ? (
        <>
          <Check className="h-3 w-3" />
          Completed
        </>
      ) : (
        <>
          <Clock className="h-3 w-3" />
          Pending
        </>
      )}
    </Badge>
  );
}
