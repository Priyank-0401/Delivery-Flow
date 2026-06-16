import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, type ProjectResponse } from '@/api/projects';
import { healthService } from '../api/health';
import { HealthRadarChart } from './HealthRadarChart';
import { HealthHistoryTrendline } from './HealthHistoryTrendline';

const statusColorMap: Record<string, string> = {
  GREEN: 'text-green-400 bg-green-500/10 border-green-500/30',
  YELLOW: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  ORANGE: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  RED: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const scoreRingColor: Record<string, string> = {
  GREEN: '#22c55e',
  YELLOW: '#eab308',
  ORANGE: '#f97316',
  RED: '#ef4444',
};

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#27272a" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-zinc-500 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

export function ProjectHealthDashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

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

  // Auto-select first project
  if (projects && projects.length > 0 && !selectedProjectId) {
    setSelectedProjectId(projects[0].id);
  }

  const ringColor = health ? scoreRingColor[health.statusColor] || '#6b7280' : '#6b7280';
  const statusClasses = health ? statusColorMap[health.statusColor] || '' : '';

  return (
    <div className="flex flex-col w-full h-full text-white gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Project Health Engine</h1>
          <p className="text-sm text-zinc-500 mt-1">Real-time objective health scoring across 8 execution dimensions</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            id="health-project-selector"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-[#1a1f2e] border border-zinc-700 text-sm text-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="">Select a project</option>
            {projects?.map((p: ProjectResponse) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={() => recalcMutation.mutate()}
            disabled={!selectedProjectId || recalcMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
          >
            {recalcMutation.isPending ? 'Calculating...' : '↻ Recalculate'}
          </button>
        </div>
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
          {/* Top Row: Score Ring + Status + Factors */}
          <div className="grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-6">
            {/* Score Ring Card */}
            <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-6 flex items-center gap-6 min-w-[340px]">
              <ScoreRing score={health.overallScore} color={ringColor} />
              <div className="flex flex-col gap-2">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full border w-fit ${statusClasses}`}>
                  {health.status}
                </span>
                <span className="text-xs text-zinc-500">
                  Last calculated: {health.lastCalculatedAt
                    ? new Date(health.lastCalculatedAt).toLocaleString()
                    : 'Never'}
                </span>
              </div>
            </div>

            {/* Contributing Factors Card */}
            <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Contributing Factors</h3>
              {health.contributingFactors && health.contributingFactors.length > 0 ? (
                <ul className="space-y-2">
                  {health.contributingFactors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                      <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">All execution metrics within normal thresholds</p>
              )}
            </div>
          </div>

          {/* Middle Row: Radar Chart + Dimension Bars */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-5 min-h-[380px]">
              <h3 className="text-sm font-semibold text-zinc-300 mb-2">Multi-Dimensional Health</h3>
              <HealthRadarChart health={health} />
            </div>

            {/* Dimension Bars */}
            <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">Dimension Breakdown</h3>
              <div className="space-y-3">
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
                  const barColor = dim.score >= 85 ? 'bg-green-500' :
                    dim.score >= 70 ? 'bg-yellow-500' :
                    dim.score >= 50 ? 'bg-orange-500' : 'bg-red-500';

                  return (
                    <div key={dim.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-400">{dim.label} <span className="text-zinc-600">({dim.weight})</span></span>
                        <span className="font-mono text-zinc-300">{dim.score}</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Row: History Trendline */}
          <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-5 min-h-[340px]">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">Health History & Daily Changes</h3>
            <HealthHistoryTrendline history={history || []} />
          </div>
        </>
      )}
    </div>
  );
}
