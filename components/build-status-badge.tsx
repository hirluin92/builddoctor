import { Badge } from "@/components/ui/badge";
import { BuildStatus } from "@/types/database";

interface BuildStatusBadgeProps {
  status: BuildStatus;
}

const statusConfig: Record<BuildStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-500 text-white",
  },
  analyzing: {
    label: "Analyzing...",
    className: "bg-blue-500 text-white animate-pulse",
  },
  completed: {
    label: "Completed",
    className: "bg-green-500 text-white",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500 text-white",
  },
};

export function BuildStatusBadge({ status }: BuildStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

