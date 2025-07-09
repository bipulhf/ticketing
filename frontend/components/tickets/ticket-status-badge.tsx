import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";

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
      label: "In Progress",
      variant: "default" as const,
      icon: AlertCircle,
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
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
