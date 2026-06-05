import { useQuery } from '@tanstack/react-query';
import { MetricCard } from '@/components/shared/MetricCard';
import { HealthScoreCard } from '@/components/shared/HealthScoreCard';
import { 
  FolderKanban, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Activity, 
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { analyticsService } from '@/api/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/shared/LoadingState';

export function DashboardHome() {
  // Fetch overall dashboard metrics
  const { 
    data: overview, 
    isLoading: isOverviewLoading, 
    isError: isOverviewError,
    refetch: refetchOverview
  } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: analyticsService.getDashboardOverview,
  });

  // Fetch recent activity events
  const { 
    data: activities, 
    isLoading: isActivitiesLoading,
    isError: isActivitiesError,
    refetch: refetchActivities
  } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: analyticsService.getRecentActivity,
  });

  const handleRefresh = () => {
    refetchOverview();
    refetchActivities();
  };

  const getEventIcon = (entityType: string) => {
    switch (entityType.toUpperCase()) {
      case 'TASK':
        return <Activity className="h-4 w-4 text-sky-400" />;
      case 'PROJECT':
        return <FolderKanban className="h-4 w-4 text-emerald-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-violet-400" />;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your delivery portfolio.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-md transition-colors"
        >
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {isOverviewLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[120px] rounded-xl border border-zinc-800 bg-zinc-950 animate-pulse" />
          ))}
        </div>
      ) : isOverviewError ? (
        <div className="p-6 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
          Failed to load dashboard metrics. Ensure backend is running.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Active Projects"
            value={overview?.totalProjects ?? 0}
            icon={<FolderKanban className="h-4 w-4 text-sky-400" />}
            subtext="Across the portfolio"
          />
          <MetricCard
            title="Blocked Tasks"
            value={overview?.blockedTasks ?? 0}
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
            subtext="Require immediate attention"
          />
          <MetricCard
            title="Active Sprints"
            value={overview?.activeSprints ?? 0}
            icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
            subtext="Sprints currently running"
          />
          <MetricCard
            title="Avg Completion Rate"
            value={`${overview?.overallCompletionRate ?? 0}%`}
            icon={<CheckCircle2 className="h-4 w-4 text-teal-400" />}
            subtext="Of total tasks completed"
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-zinc-950 border-zinc-800 text-white shadow-xl flex flex-col min-h-[400px]">
          <CardHeader className="border-b border-zinc-900 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Recent Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[360px] p-0 custom-scrollbar">
            {isActivitiesLoading ? (
              <LoadingState message="Fetching recent events..." />
            ) : isActivitiesError ? (
              <div className="p-8 text-center text-sm text-red-400">
                Failed to load activities.
              </div>
            ) : !activities || activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full text-zinc-500">
                <Clock className="h-10 w-10 mb-4 text-zinc-700 stroke-[1.5]" />
                <p className="text-sm font-semibold">No recent activity found</p>
                <p className="text-xs max-w-[240px] mt-1 text-zinc-600">Events will appear here as tasks and projects are created or updated.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-900">
                {activities.map((event) => (
                  <div key={event.id} className="flex items-start gap-4 p-4 hover:bg-zinc-900/50 transition-colors">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      {getEventIcon(event.entityType)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-zinc-200">{event.message}</p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="font-semibold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] uppercase">
                          {event.eventType}
                        </span>
                        <span>•</span>
                        <span>{formatTime(event.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="col-span-3">
          <HealthScoreCard 
            score={Math.round(overview?.overallCompletionRate ?? 0)} 
            trend={0} 
          />
        </div>
      </div>
    </div>
  );
}
