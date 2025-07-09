import { Badge } from "@/components/ui/badge";
import { Clock, Check } from "lucide-react";

interface TicketStatusBadgeProps {
  status: "pending" | "solved";
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pending",
      variant: "secondary" as const,
      icon: Clock,
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    solved: {
      label: "Solved",
      variant: "secondary" as const,
      icon: Check,
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
