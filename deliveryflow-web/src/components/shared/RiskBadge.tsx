import { cn } from "@/lib/utils";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const styles = {
    LOW: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    MEDIUM: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    HIGH: "bg-red-500/10 text-red-500 border border-red-500/20",
    CRITICAL: "bg-red-900/30 text-red-500 font-bold border border-red-500/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        styles[level],
        className
      )}
    >
      {level}
    </span>
  );
}
