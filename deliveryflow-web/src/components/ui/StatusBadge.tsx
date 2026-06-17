import { CheckCircle2, AlertTriangle, XCircle, Info, Minus } from 'lucide-react';

export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  showIcon?: boolean;
}

const config = {
  success: {
    classes: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle2,
  },
  warning: {
    classes: 'bg-warning/10 text-warning border-warning/20',
    icon: AlertTriangle,
  },
  danger: {
    classes: 'bg-danger/10 text-danger border-danger/20',
    icon: XCircle,
  },
  info: {
    classes: 'bg-info/10 text-info border-info/20',
    icon: Info,
  },
  neutral: {
    classes: 'bg-neutral/10 text-neutral border-neutral/20',
    icon: Minus,
  },
};

export function StatusBadge({ status, label, showIcon = false }: StatusBadgeProps) {
  const { classes, icon: Icon } = config[status] || config['neutral'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${classes}`}>
      {showIcon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  );
}
