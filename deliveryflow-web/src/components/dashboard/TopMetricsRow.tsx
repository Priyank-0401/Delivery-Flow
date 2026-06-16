import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { DashboardOverview } from '@/api/analytics';

interface TopMetricsRowProps {
  overview?: DashboardOverview;
}

// Dummy data for sparklines
const healthData = Array.from({ length: 20 }, (_, i) => ({ value: 60 + Math.random() * 30 + i }));
const riskData = Array.from({ length: 20 }, (_, i) => ({ value: 20 + Math.random() * 40 + (i * 2) }));
const velocityData = Array.from({ length: 10 }, () => ({ value: 30 + Math.random() * 20 }));

const SPRINT_DATA = [
  { name: 'Completed', value: 34, color: '#10b981' },
  { name: 'In Progress', value: 16, color: '#3b82f6' },
  { name: 'To Do', value: 20, color: '#6b7280' },
];

export function TopMetricsRow({ overview }: TopMetricsRowProps) {
  const healthScore = Math.round(overview?.overallCompletionRate ?? 72);
  const sprintProgress = Math.round((34 / (34 + 16 + 20)) * 100);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
      
      {/* Project Health Score */}
      <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
        <h3 className="text-sm font-semibold text-zinc-300">Project Health Score</h3>
        <div className="flex items-end justify-between mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-emerald-400">{healthScore}</span>
            <span className="text-lg text-emerald-500/50 font-medium">/100</span>
          </div>
        </div>
        <div className="h-16 mt-2 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={healthData}>
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-400">
          <ArrowUpRight className="h-3 w-3" />
          <span>8 vs last 7 days</span>
        </div>
      </div>

      {/* Sprint Progress */}
      <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
        <h3 className="text-sm font-semibold text-zinc-300">Sprint Progress</h3>
        <div className="flex items-center gap-6 mt-2">
          <div className="relative h-20 w-20 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SPRINT_DATA}
                  innerRadius={28}
                  outerRadius={38}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {SPRINT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{sprintProgress}%</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            {SPRINT_DATA.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-400">{item.name}</span>
                </div>
                <span className="font-semibold text-zinc-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 text-xs font-medium text-zinc-500">
          12 days left in sprint
        </div>
      </div>

      {/* Risk Score */}
      <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
        <h3 className="text-sm font-semibold text-zinc-300">Risk Score</h3>
        <div className="mt-2">
          <span className="text-4xl font-bold text-red-500">High</span>
        </div>
        <div className="h-16 mt-2 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={riskData}>
              <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-red-500">
          <ArrowUpRight className="h-3 w-3" />
          <span>15 vs last 7 days</span>
        </div>
      </div>

      {/* Velocity */}
      <div className="bg-[#131720] border border-zinc-800/50 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
        <h3 className="text-sm font-semibold text-zinc-300">Velocity</h3>
        <div className="flex flex-col mt-2">
          <span className="text-4xl font-bold text-sky-400">42</span>
          <span className="text-xs text-sky-500/70 font-medium">Story Points</span>
        </div>
        <div className="h-14 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={velocityData}>
              <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-sky-400">
          <ArrowDownRight className="h-3 w-3" />
          <span>5 vs last sprint</span>
        </div>
      </div>

    </div>
  );
}
