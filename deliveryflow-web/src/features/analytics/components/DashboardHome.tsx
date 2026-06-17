import { useQuery } from '@tanstack/react-query';
import { healthService } from '@/features/health/api/health';
import { useProjectStore } from '@/store/useProjectStore';
import { DependencyMapPreview } from '@/components/dashboard/DependencyMapPreview';
import { TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';

export function DashboardHome() {
  const { selectedProjectId } = useProjectStore();

  const { data: health } = useQuery({
    queryKey: ['projectHealth', selectedProjectId],
    queryFn: () => healthService.getProjectHealth(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  const score = health?.overallScore || 78;
  const isHealthy = score >= 85;
  const isAtRisk = score >= 60 && score < 85;
  const statusColor = isHealthy ? 'text-emerald-500' : isAtRisk ? 'text-amber-500' : 'text-red-500';
  const statusBg = isHealthy ? 'bg-emerald-500/10' : isAtRisk ? 'bg-amber-500/10' : 'bg-red-500/10';
  const statusLabel = isHealthy ? 'HEALTHY' : isAtRisk ? 'AT RISK' : 'CRITICAL';

  return (
    <div className="flex flex-col w-full h-full space-y-8">
      {/* Hero Section */}
      <div className="grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-8">
        <div className="flex flex-col gap-2 min-w-[300px]">
          <h2 className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-2">Project Score</h2>
          <div className="flex items-end gap-4">
            <span className={`text-8xl font-black tracking-tighter leading-none ${statusColor}`}>
              {score}
            </span>
            <div className="flex flex-col pb-2 gap-2">
              <span className={`px-3 py-1 rounded-sm text-sm font-bold tracking-widest ${statusColor} ${statusBg} w-fit`}>
                {statusLabel}
              </span>
              <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> +5 this week
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-6 shadow-xl flex flex-col justify-center">
          <h3 className="text-sm font-black text-zinc-200 mb-4 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" /> Primary Risks
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-white font-medium text-lg">
              <span className="text-red-500 mt-1 flex-shrink-0">•</span>
              Payment Gateway blocking release
            </li>
            <li className="flex items-start gap-3 text-white font-medium text-lg">
              <span className="text-amber-500 mt-1 flex-shrink-0">•</span>
              Backend team overloaded by 15%
            </li>
            <li className="flex items-start gap-3 text-white font-medium text-lg">
              <span className="text-amber-500 mt-1 flex-shrink-0">•</span>
              Sprint velocity dropped 12%
            </li>
          </ul>
        </div>
      </div>

      {/* Critical Path Graph - Full Width Centerpiece */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white tracking-tight">CRITICAL PATH</h3>
        </div>
        <div className="bg-[#0B0E14] border border-zinc-800 rounded-xl h-[450px] relative overflow-hidden shadow-inner">
          {/* We reuse the existing map preview, but in the new layout it expands fully */}
          <DependencyMapPreview />
        </div>
      </div>

      {/* Bottom Section: Team Health & AI Briefing */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
        
        {/* Team Health Horizontal Bars */}
        <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-6 shadow-xl">
          <h3 className="text-sm font-black text-zinc-200 mb-6 uppercase tracking-wider">Team Capacity Utilization</h3>
          
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-bold text-white text-base">Backend Team</span>
                <span className="font-bold text-red-500 text-base">135%</span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-bold text-white text-base">Frontend Team</span>
                <span className="font-bold text-emerald-500 text-base">82%</span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '82%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-bold text-white text-base">Analytics Team</span>
                <span className="font-bold text-blue-400 text-base">45%</span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Massive AI Briefing */}
        <div className="bg-gradient-to-br from-[#1a1528] to-[#131720] border border-purple-500/30 rounded-xl p-8 shadow-[0_0_30px_rgba(168,85,247,0.1)] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h3 className="text-sm font-black text-purple-300 uppercase tracking-widest">Project Briefing</h3>
          </div>
          
          <div className="space-y-6 text-zinc-200 leading-relaxed text-lg font-medium">
            <p>
              <strong className="text-white">Payment Gateway</strong> is projected to delay release by 2 days.
            </p>
            <p>
              Backend utilization exceeded target capacity for 3 consecutive sprints.
            </p>
            <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg p-5 mt-auto shadow-inner">
              <span className="text-purple-300 font-black text-xs uppercase tracking-widest block mb-2">Recommendation</span>
              <span className="text-white font-bold">Reallocate 1 engineer from Analytics to Backend</span> to balance load and resolve the Gateway blocker.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
