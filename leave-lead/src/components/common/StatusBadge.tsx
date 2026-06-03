import { cn } from "@/lib/utils";

const labels: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
  ON_TIME: "À l'heure",
  LATE: "En retard",
  ABSENT: "Absent",
};

export const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    PENDING: "bg-warning/15 text-warning border-warning/30",
    APPROVED: "bg-success/15 text-success border-success/30",
    REJECTED: "bg-destructive/15 text-destructive border-destructive/30",
    ON_TIME: "bg-success/15 text-success border-success/30",
    LATE: "bg-warning/15 text-warning border-warning/30",
    ABSENT: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", map[status] || "bg-muted text-muted-foreground border-border")}>
      {labels[status] || status}
    </span>
  );
};
