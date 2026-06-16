import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { ProjectHealthResponse } from '../types';

interface HealthRadarChartProps {
  health: ProjectHealthResponse;
}

const dimensionLabels: Record<string, string> = {
  velocity: 'Velocity',
  blocker: 'Blockers',
  defect: 'Defects',
  dependency: 'Dependencies',
  utilization: 'Utilization',
  stability: 'Stability',
  scopeCreep: 'Scope Creep',
  releaseConfidence: 'Release',
};

export function HealthRadarChart({ health }: HealthRadarChartProps) {
  const data = [
    { dimension: dimensionLabels.velocity, score: health.velocityScore, fullMark: 100 },
    { dimension: dimensionLabels.blocker, score: health.blockerScore, fullMark: 100 },
    { dimension: dimensionLabels.defect, score: health.defectScore, fullMark: 100 },
    { dimension: dimensionLabels.dependency, score: health.dependencyScore, fullMark: 100 },
    { dimension: dimensionLabels.utilization, score: health.utilizationScore, fullMark: 100 },
    { dimension: dimensionLabels.stability, score: health.stabilityScore, fullMark: 100 },
    { dimension: dimensionLabels.scopeCreep, score: health.scopeCreepScore, fullMark: 100 },
    { dimension: dimensionLabels.releaseConfidence, score: health.releaseConfidenceScore, fullMark: 100 },
  ];

  const getGradientColor = () => {
    const score = health.overallScore;
    if (score >= 85) return { fill: '#22c55e', stroke: '#16a34a' };
    if (score >= 70) return { fill: '#eab308', stroke: '#ca8a04' };
    if (score >= 50) return { fill: '#f97316', stroke: '#ea580c' };
    return { fill: '#ef4444', stroke: '#dc2626' };
  };

  const colors = getGradientColor();

  return (
    <div className="w-full h-full min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid
            stroke="#374151"
            strokeOpacity={0.5}
          />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickCount={5}
          />
          <Tooltip
            contentStyle={{
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value}/100`, 'Score']}
          />
          <Radar
            name="Health"
            dataKey="score"
            stroke={colors.stroke}
            fill={colors.fill}
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
