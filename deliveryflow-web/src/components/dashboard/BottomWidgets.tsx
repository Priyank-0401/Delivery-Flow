import { AlertTriangle, TrendingUp, TrendingDown, Server, Database, Shield, Zap, CheckCircle2, Clock, Activity, MessageSquare } from 'lucide-react';

export function TopRisksWidget() {
  const risks = [
    { id: 1, title: 'Database Migration Delay', level: 'High', area: 'Infrastructure', icon: <Database className="h-4 w-4 text-red-400" /> },
    { id: 2, title: 'Auth API Rate Limits', level: 'Medium', area: 'Security', icon: <Shield className="h-4 w-4 text-amber-400" /> },
    { id: 3, title: 'Cloud Resource Limits', level: 'Low', area: 'DevOps', icon: <Server className="h-4 w-4 text-emerald-400" /> },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-sm font-semibold text-zinc-300 mb-4">Top Risks</h3>
      <div className="flex flex-col gap-3 flex-1">
        {risks.map(risk => (
          <div key={risk.id} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 transition-colors">
            <div className={`mt-0.5 p-1.5 rounded-md ${
              risk.level === 'High' ? 'bg-red-500/10' : risk.level === 'Medium' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
            }`}>
              {risk.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-zinc-200">{risk.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  risk.level === 'High' ? 'text-red-400 bg-red-500/10' : risk.level === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'
                }`}>
                  {risk.level}
                </span>
                <span className="text-[10px] text-zinc-500">{risk.area}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full text-xs font-medium text-zinc-400 hover:text-white transition-colors text-center py-2 border-t border-zinc-800">
        View Risk Register
      </button>
    </div>
  );
}

export function TeamWorkloadWidget() {
  const teams = [
    { name: 'Frontend Eng', load: 92, trend: 'up' },
    { name: 'Backend API', load: 78, trend: 'stable' },
    { name: 'DevOps', load: 105, trend: 'up' },
    { name: 'QA Team', load: 45, trend: 'down' },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-sm font-semibold text-zinc-300 mb-4">Team Workload</h3>
      <div className="flex flex-col gap-4 flex-1">
        {teams.map(team => (
          <div key={team.name} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-300 font-medium">{team.name}</span>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${team.load > 90 ? 'text-red-400' : team.load > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {team.load}%
                </span>
                {team.trend === 'up' ? <TrendingUp className="h-3 w-3 text-red-400" /> : team.trend === 'down' ? <TrendingDown className="h-3 w-3 text-emerald-400" /> : <TrendingUp className="h-3 w-3 text-zinc-600" />}
              </div>
            </div>
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${team.load > 90 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : team.load > 70 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}
                style={{ width: `${Math.min(team.load, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full text-xs font-medium text-zinc-400 hover:text-white transition-colors text-center py-2 border-t border-zinc-800">
        Resource Allocation
      </button>
    </div>
  );
}

export function AIInsightsWidget() {
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent z-0 pointer-events-none" />
      <h3 className="text-sm font-semibold text-purple-400 mb-4 flex items-center gap-2 z-10">
        <Zap className="h-4 w-4 fill-purple-500/20" />
        AI Delivery Insights
      </h3>
      
      <div className="flex flex-col gap-4 z-10 flex-1">
        <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 backdrop-blur-sm relative overflow-hidden group-hover:border-purple-500/20 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
          <h4 className="text-xs font-semibold text-zinc-200 mb-1">Schedule Risk Detected</h4>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Based on current velocity (42 pts/sprint), the <span className="text-purple-400 font-medium">Payment Gateway</span> module is highly likely to slip past the Q3 milestone.
          </p>
          <div className="mt-3 flex gap-2">
            <button className="text-[10px] font-medium px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
              Reallocate Resources
            </button>
            <button className="text-[10px] font-medium px-2 py-1 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition-colors">
              Dismiss
            </button>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-sm relative overflow-hidden group-hover:border-emerald-500/20 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <h4 className="text-xs font-semibold text-zinc-200 mb-1">Velocity Optimization</h4>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Frontend Eng team is overloaded (92%). Consider moving 2 React tasks to the Backend team who has 45% capacity.
          </p>
        </div>
      </div>
    </div>
  );
}

export function RecentActivityWidget() {
  const activities = [
    { id: 1, text: 'Payment Gateway API pushed to Staging', time: '10 mins ago', icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> },
    { id: 2, text: 'Sarah raised a blocking issue on AUTH-2', time: '1 hr ago', icon: <AlertTriangle className="h-4 w-4 text-red-400" /> },
    { id: 3, text: 'Sprint 14 planning completed', time: '3 hrs ago', icon: <Clock className="h-4 w-4 text-sky-400" /> },
    { id: 4, text: 'New PR comments on Database Schema', time: '5 hrs ago', icon: <MessageSquare className="h-4 w-4 text-purple-400" /> },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-zinc-500" />
        Recent Activity
      </h3>
      <div className="flex flex-col gap-4 flex-1">
        {activities.map((act, i) => (
          <div key={act.id} className="flex gap-3 relative">
            {i !== activities.length - 1 && (
              <div className="absolute left-2 top-6 bottom-[-16px] w-px bg-zinc-800" />
            )}
            <div className="relative z-10 bg-[#131720] rounded-full mt-0.5">
              {act.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-300 leading-tight">{act.text}</span>
              <span className="text-[10px] text-zinc-500 mt-1">{act.time}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full text-xs font-medium text-zinc-400 hover:text-white transition-colors text-center py-2 border-t border-zinc-800">
        View All Activity
      </button>
    </div>
  );
}
