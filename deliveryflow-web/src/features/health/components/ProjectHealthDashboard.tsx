import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthService } from '../api/health';
import { ShieldAlert, AlertCircle, TrendingUp, CheckCircle2, Activity, Bug, ArrowRight } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { HealthHistoryTrendline } from './HealthHistoryTrendline';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';

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

  return (
    <div className="flex flex-col w-full h-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-zinc-900">Health Dashboard</h2>
          <p className="text-zinc-500 mt-2 font-medium text-sm">Multi-dimensional risk assessment.</p>
        </div>
        <Button
          onClick={() => recalcMutation.mutate()}
          disabled={!selectedProjectId || recalcMutation.isPending}
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-sm"
        >
          {recalcMutation.isPending ? 'Calculating...' : 'Recalculate Score'}
        </Button>
      </div>

      {!selectedProjectId && (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50 h-64">
          <span className="text-zinc-500 font-semibold mb-3">No project selected.</span>
          <p className="text-zinc-400 text-sm">Select a project from the command palette to view its health.</p>
        </div>
      )}

      {selectedProjectId && healthLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {health && (
        <>
          {/* Top Row Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Overall Health"
              value={health.overallScore.toString()}
              icon={Activity}
              trend={{ value: '+5 this week', isPositive: true }}
              subtitle={health.status}
            />
            <StatCard 
              title="Velocity Score"
              value={health.velocityScore.toString()}
              icon={TrendingUp}
              trend={{ value: 'Stable', isPositive: true }}
              subtitle="Consistency over last 3 sprints"
            />
            <StatCard 
              title="Defect Density"
              value={health.defectScore.toString()}
              icon={Bug}
              trend={{ value: '-2 this week', isPositive: false }}
              subtitle="Bugs per 100 lines of code"
            />
          </div>

          {/* Stories Section: What's helping vs What's hurting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* What's helping? */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                What's helping?
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 group">
                  <div className="p-2 bg-emerald-50 rounded-lg shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-zinc-900 font-bold text-sm">Velocity Improved</h4>
                    <p className="text-zinc-500 text-sm mt-1 leading-relaxed">Team velocity stabilized at 10% above target for 2 consecutive sprints.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="p-2 bg-emerald-50 rounded-lg shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-zinc-900 font-bold text-sm">Code Quality</h4>
                    <p className="text-zinc-500 text-sm mt-1 leading-relaxed">Test coverage increased to 85%, reducing defect leakage to production.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* What's hurting? */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                What's hurting?
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 group cursor-pointer">
                  <div className="p-2 bg-red-50 rounded-lg shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-zinc-900 font-bold text-sm">Critical Path Delay</h4>
                      <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                    </div>
                    <p className="text-zinc-500 text-sm mt-1 leading-relaxed">3 tasks on the critical sequence are currently blocked.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 group cursor-pointer">
                  <div className="p-2 bg-amber-50 rounded-lg shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-zinc-900 font-bold text-sm">Backend Overload</h4>
                      <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                    </div>
                    <p className="text-zinc-500 text-sm mt-1 leading-relaxed">Backend capacity is utilized at 135%, predicting burnout and delays.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Secondary Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Trend */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                <h3 className="font-bold text-zinc-900">30-Day Trend</h3>
              </div>
              <div className="p-6 min-h-[300px] flex-1 flex flex-col">
                <HealthHistoryTrendline history={history || []} />
              </div>
            </div>

            {/* Dimension Breakdown Bars */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                <h3 className="font-bold text-zinc-900">Dimension Breakdown</h3>
              </div>
              <div className="p-6 flex-1">
                <div className="space-y-5">
                  {[
                    { label: 'Velocity Consistency', score: health.velocityScore },
                    { label: 'Blocker Density', score: health.blockerScore },
                    { label: 'Defect Leakage', score: health.defectScore },
                    { label: 'Dependency Risk', score: health.dependencyScore },
                    { label: 'Team Utilization', score: health.utilizationScore },
                    { label: 'Sprint Stability', score: health.stabilityScore },
                    { label: 'Scope Creep', score: health.scopeCreepScore },
                    { label: 'Release Confidence', score: health.releaseConfidenceScore },
                  ].map((dim) => {
                    const barColor = dim.score >= 85 ? 'bg-emerald-500' :
                      dim.score >= 70 ? 'bg-amber-500' :
                      dim.score >= 50 ? 'bg-orange-500' : 'bg-red-500';

                    return (
                      <div key={dim.label}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="font-semibold text-zinc-700">{dim.label}</span>
                          <span className="font-bold text-zinc-900">{dim.score}</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                            style={{ width: `${dim.score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
