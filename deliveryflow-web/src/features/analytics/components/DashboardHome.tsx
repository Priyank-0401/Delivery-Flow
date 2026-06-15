import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/api/analytics';
import { TopMetricsRow } from '@/components/dashboard/TopMetricsRow';
import { DependencyMapPreview } from '@/components/dashboard/DependencyMapPreview';
import { CriticalPathList } from '@/components/dashboard/CriticalPathList';
import { TopRisksWidget, TeamWorkloadWidget, AIInsightsWidget, RecentActivityWidget } from '@/components/dashboard/BottomWidgets';

export function DashboardHome() {
  const { data: overview } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: analyticsService.getDashboardOverview,
  });

  return (
    <div className="flex flex-col w-full h-full text-white">
      {/* Top 4 Metrics Cards */}
      <TopMetricsRow overview={overview} />

      {/* Middle Section: Graph + Critical Path */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6 mb-6">
        <div className="bg-[#131720] border border-zinc-800/50 rounded-xl min-h-[400px] p-5 flex flex-col relative overflow-hidden">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4 z-10">Dependency Map</h3>
          <div className="flex-1 w-full relative">
            <DependencyMapPreview />
          </div>
        </div>
        <div className="bg-[#131720] border border-zinc-800/50 rounded-xl min-h-[400px] p-5">
          <CriticalPathList />
        </div>
      </div>

      {/* Bottom Section: Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-[#131720] border border-zinc-800/50 rounded-xl min-h-[300px] p-5">
          <TopRisksWidget />
        </div>
        <div className="bg-[#131720] border border-zinc-800/50 rounded-xl min-h-[300px] p-5">
          <TeamWorkloadWidget />
        </div>
        <div className="bg-[#131720] border border-zinc-800/50 rounded-xl min-h-[300px] p-0">
          <AIInsightsWidget />
        </div>
        <div className="bg-[#131720] border border-zinc-800/50 rounded-xl min-h-[300px] p-5">
          <RecentActivityWidget />
        </div>
      </div>

    </div>
  );
}
