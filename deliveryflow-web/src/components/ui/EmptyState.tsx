import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50 w-full h-full min-h-[240px]">
      <div className="p-3 bg-white border border-zinc-100 shadow-sm rounded-xl mb-4">
        <Icon className="w-6 h-6 text-zinc-400" />
      </div>
      <h3 className="text-zinc-900 font-semibold mb-1">{title}</h3>
      {description && <p className="text-zinc-500 text-sm mb-6 max-w-sm">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
