
import { MetricCard } from '@/components/shared/MetricCard';
import { FolderKanban, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { HealthScoreCard } from '@/components/shared/HealthScoreCard';

export function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your delivery portfolio.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Projects"
          value="12"
          icon={<FolderKanban className="h-4 w-4" />}
          subtext="+2 from last month"
        />
        <MetricCard
          title="At Risk Projects"
          value="3"
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          subtext="Requires immediate attention"
        />
        <MetricCard
          title="Completed Milestones"
          value="28"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          subtext="In the last 30 days"
        />
        <MetricCard
          title="Avg Velocity"
          value="42 pts"
          icon={<TrendingUp className="h-4 w-4" />}
          subtext="Across 8 agile teams"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Delivery Timeline Chart (Placeholder)</p>
        </div>
        <div className="col-span-3">
          <HealthScoreCard score={72} trend={-4} />
        </div>
      </div>
    </div>
  );
}
