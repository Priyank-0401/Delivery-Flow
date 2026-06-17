import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtitle?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, subtitle, trend }: StatCardProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-zinc-400" />}
        <h3 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-widest">{title}</h3>
      </div>
      
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-4xl font-black text-zinc-900 tracking-tight">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${trend.isPositive ? 'text-success' : 'text-danger'}`}>
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="text-xs text-zinc-500 font-medium mt-1">
          {subtitle}
        </div>
      )}
    </div>
  );
}
