import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthService } from '../api/health';
import { ShieldAlert, AlertCircle, TrendingUp } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { HealthRadarChart } from './HealthRadarChart';
import { HealthHistoryTrendline } from './HealthHistoryTrendline';

const statusColorMap: Record<string, string> = {
  GREEN: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  YELLOW: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  ORANGE: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  RED: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const scoreRingColor: Record<string, string> = {
  GREEN: '#10b981',
  YELLOW: '#f59e0b',
  ORANGE: '#f97316',
  RED: '#ef4444',
};

function MassiveScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-64 h-64 flex-shrink-0 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#18181b" strokeWidth="12" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 10px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-7xl font-black text-white tracking-tighter">{score}</span>
        <span className="text-sm font-bold text-zinc-500 mt-1 tracking-widest uppercase">/ 100</span>
      </div>
    </div>
  );
}

export function ProjectHealthDashboard() {
  const { selectedProjectId } = useProjectStore();
  const queryClient = useQueryClient();


  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['projectHealth', selectedProjectId],
    queryFn: () => healthService.getProjectHealth(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  const { data: history } = useQuery({
    queryKey: ['healthHistory', selectedProjectId],
    queryFn: () => healthService.getHealthHistory(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  const recalcMutation = useMutation({
    mutationFn: () => healthService.recalculateHealth(selectedProjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectHealth', selectedProjectId] });
      queryClient.invalidateQueries({ queryKey: ['healthHistory', selectedProjectId] });
    },
  });

  const ringColor = health ? scoreRingColor[health.statusColor] || '#6b7280' : '#6b7280';
  const statusClasses = health ? statusColorMap[health.statusColor] || '' : '';

  return (
    <div className="flex flex-col w-full h-full text-white space-y-8">
      {/* Header (Removed local dropdown, using Global) */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">Project Health</h2>
          <p className="text-zinc-400 font-medium tracking-wide mt-1 uppercase text-xs">Multi-dimensional risk assessment.</p>
        </div>
        <button
          onClick={() => recalcMutation.mutate()}
          disabled={!selectedProjectId || recalcMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm px-5 py-2 rounded-lg transition-colors font-bold tracking-wide"
        >
          {recalcMutation.isPending ? 'Calculating...' : '↻ Recalculate'}
        </button>
      </div>

      {!selectedProjectId && (
        <div className="flex items-center justify-center h-64 text-zinc-500">
          Select a project to view its health dashboard
        </div>
      )}

      {selectedProjectId && healthLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {health && (
        <>
          {/* Top Tri-Panel Layout: Score | Factors | Trend */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left: Massive Score */}
            <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-8 flex flex-col items-center justify-center shadow-xl">
              <MassiveScoreRing score={health.overallScore} color={ringColor} />
              <div className="mt-8 text-center">
                <span className={`text-xl font-black px-6 py-2 rounded-md border tracking-widest ${statusClasses}`}>
                  {health.status}
                </span>
                <p className="text-xs font-bold text-zinc-600 mt-4 uppercase tracking-widest">
                  Last updated: {health.lastCalculatedAt ? new Date(health.lastCalculatedAt).toLocaleTimeString() : 'Never'}
                </p>
              </div>
            </div>

            {/* Center: Contributing Factors */}
            <div className="bg-[#131720] border border-zinc-800/80 rounded-2xl p-8 flex flex-col justify-center shadow-xl">
              <h3 className="text-sm font-black text-zinc-300 uppercase tracking-widest mb-6">Contributing Factors</h3>
              <div className="space-y-6">
                <div className="bg-[#0B0E14] border border-zinc-800/50 p-5 rounded-xl flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">High Risk Dependencies</h4>
                      <p className="text-sm text-zinc-400 font-medium">3 critical path items blocked</p>
                    </div>
                  </div>
                  <span className="text-red-500 font-black text-xl">-12</span>
                </div>
                
                <div className="bg-[#0B0E14] border border-zinc-800/50 p-5 rounded-xl flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">Velocity Drop</h4>
                      <p className="text-sm text-zinc-400 font-medium">15% below target for 2 sprints</p>
                    </div>
                  </div>
                  <span className="text-amber-500 font-black text-xl">-8</span>
                </div>
                
                <div className="bg-[#0B0E14] border border-zinc-800/50 p-5 rounded-xl flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">Code Quality</h4>
                      <p className="text-sm text-zinc-400 font-medium">Test coverage improved to 85%</p>
                    </div>
                  </div>
                  <span className="text-emerald-500 font-black text-xl">+5</span>
                </div>
              </div>
            </div>

            {/* Right: Trend */}
            <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-8 shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-zinc-400 mb-6 uppercase tracking-widest">30-Day Trend</h3>
              <div className="flex-1 min-h-[200px] w-full">
                <HealthHistoryTrendline history={history || []} />
              </div>
            </div>

          </div>

          {/* Bottom Layout: Radar + Dimension Breakdown */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
            
            {/* Massive Radar Chart */}
            <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-8 shadow-xl min-h-[500px] flex flex-col">
              <h3 className="text-sm font-bold text-zinc-400 mb-6 uppercase tracking-widest">Multi-Dimensional Health</h3>
              <div className="flex-1 relative w-full h-full">
                <HealthRadarChart health={health} />
              </div>
            </div>

            {/* Dimension Breakdown Bars */}
            <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-8 shadow-xl">
              <h3 className="text-sm font-bold text-zinc-400 mb-8 uppercase tracking-widest">Dimension Breakdown</h3>
              <div className="space-y-6">
                {[
                  { label: 'Velocity Consistency', score: health.velocityScore, weight: '15%' },
                  { label: 'Blocker Density', score: health.blockerScore, weight: '15%' },
                  { label: 'Defect Leakage', score: health.defectScore, weight: '10%' },
                  { label: 'Dependency Risk', score: health.dependencyScore, weight: '20%' },
                  { label: 'Team Utilization', score: health.utilizationScore, weight: '10%' },
                  { label: 'Sprint Stability', score: health.stabilityScore, weight: '10%' },
                  { label: 'Scope Creep', score: health.scopeCreepScore, weight: '10%' },
                  { label: 'Release Confidence', score: health.releaseConfidenceScore, weight: '10%' },
                ].map((dim) => {
                  const barColor = dim.score >= 85 ? 'bg-emerald-500' :
                    dim.score >= 70 ? 'bg-amber-500' :
                    dim.score >= 50 ? 'bg-orange-500' : 'bg-red-500';

                  return (
                    <div key={dim.label}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-bold text-zinc-300">{dim.label} <span className="text-zinc-600 font-normal">({dim.weight})</span></span>
                        <span className="font-mono font-bold text-white">{dim.score}</span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                          style={{ width: `${dim.score}%`, filter: `drop-shadow(0 0 8px ${barColor}80)` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
