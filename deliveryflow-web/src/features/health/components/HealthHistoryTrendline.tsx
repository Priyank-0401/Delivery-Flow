import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Bar,
} from 'recharts';
import type { HealthHistoryResponse } from '../types';

interface HealthHistoryTrendlineProps {
  history: HealthHistoryResponse[];
}

export function HealthHistoryTrendline({ history }: HealthHistoryTrendlineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[280px] text-zinc-500 text-sm">
        No health history data available yet. Daily snapshots are captured at midnight.
      </div>
    );
  }

  const data = history.map((h) => ({
    date: new Date(h.snapshotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: h.score,
    delta: h.healthDelta,
  }));

  return (
    <div className="w-full h-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            strokeOpacity={0.3}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            axisLine={{ stroke: '#374151' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            axisLine={{ stroke: '#374151' }}
          />
          <Tooltip
            contentStyle={{
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'score') return [`${value}/100`, 'Health Score'];
              if (name === 'delta') {
                const prefix = value >= 0 ? '+' : '';
                return [`${prefix}${value}`, 'Daily Δ'];
              }
              return [value, name];
            }}
          />
          {/* Threshold reference lines */}
          <ReferenceLine y={85} stroke="#22c55e" strokeDasharray="6 3" strokeOpacity={0.4} />
          <ReferenceLine y={70} stroke="#eab308" strokeDasharray="6 3" strokeOpacity={0.4} />
          <ReferenceLine y={50} stroke="#f97316" strokeDasharray="6 3" strokeOpacity={0.4} />

          <Area
            type="monotone"
            dataKey="score"
            stroke="none"
            fill="url(#healthGradient)"
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#818cf8"
            strokeWidth={2}
            dot={{ fill: '#818cf8', r: 3 }}
            activeDot={{ r: 5, fill: '#6366f1' }}
          />
          <Bar
            dataKey="delta"
            barSize={12}
            fill="#6366f1"
            opacity={0.6}
            radius={[2, 2, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
