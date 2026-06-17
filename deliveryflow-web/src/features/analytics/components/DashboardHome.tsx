import { useQuery } from '@tanstack/react-query';
import { healthService } from '@/features/health/api/health';
import { useProjectStore } from '@/store/useProjectStore';
import { StatCard } from '@/components/ui/StatCard';
import { ShieldAlert, TrendingUp, Activity, CheckCircle2, AlertCircle, Calendar, AlertTriangle, Sparkles, User, Ban } from 'lucide-react';

export function DashboardHome() {
  const { selectedProjectId } = useProjectStore();

  const { data: health } = useQuery({
    queryKey: ['projectHealth', selectedProjectId],
    queryFn: () => healthService.getProjectHealth(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  const score = health?.overallScore || 87;

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50 h-[calc(100vh-200px)]">
        <span className="text-zinc-500 font-semibold mb-3">No project selected.</span>
        <p className="text-zinc-400 text-sm">Select a project from the command palette to view the executive overview.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full space-y-6">
      
      {/* Top Row: Executive KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard 
          title="Health Score"
          value={score.toString()}
          icon={Activity}
          trend={{ value: '+5 this week', isPositive: true }}
          subtitle="Healthy"
        />
        <StatCard 
          title="Blocked Tasks"
          value="3"
          icon={Ban}
          trend={{ value: '+1 since yesterday', isPositive: false }}
          subtitle="2 Critical, 1 Medium"
        />
        <StatCard 
          title="Active Risks"
          value="2"
          icon={AlertTriangle}
          trend={{ value: 'Stable', isPositive: true }}
          subtitle="1 Schedule, 1 Resource"
        />
        <StatCard 
          title="Forecast"
          value="On Track"
          icon={CheckCircle2}
          trend={{ value: '2d buffer', isPositive: true }}
          subtitle="v1.2.0 Release"
        />
      </div>

      {/* Second Row: Progress & Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sprint Progress */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-zinc-900 font-bold text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Sprint Progress
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 px-2 py-1 rounded">Sprint 4</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-600 transition-all duration-1000 ease-out"
                  strokeDasharray="74, 100"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xl font-bold text-zinc-900">74%</span>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm font-semibold text-zinc-900 mb-1">12 of 16 tasks completed</div>
              <p className="text-xs text-zinc-500 font-medium">3 days remaining in current sprint. Forecast indicates we will complete all committed work.</p>
            </div>
          </div>
        </div>

        {/* Team Utilization */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-zinc-900 font-bold text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> Team Utilization
            </h2>
            <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded">82% Avg</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-zinc-900">Backend</span>
                <span className="text-red-600">135%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-zinc-900">Frontend</span>
                <span className="text-emerald-600">82%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Third Row: Risks & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Risks */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-zinc-900 font-bold text-base mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" /> Top Risks
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-4 p-3 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Payment Gateway Integration</h3>
                <p className="text-xs text-red-800 font-medium mt-1">Vendor API is responding with 500s in staging environment, blocking UAT.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Backend Capacity</h3>
                <p className="text-xs text-amber-800 font-medium mt-1">Backend team has been operating at &gt;120% capacity for 3 consecutive sprints.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-zinc-900 font-bold text-base mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" /> Upcoming Milestones
          </h2>
          <ul className="space-y-4">
            <li className="flex items-center justify-between p-3 border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Sprint 4 Review</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">Internal Demo</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-zinc-100 text-zinc-900 px-2 py-1 rounded">In 3 Days</span>
            </li>
            <li className="flex items-center justify-between p-3 border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">v1.2.0 Release Candidate</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">Code Freeze</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-zinc-100 text-zinc-900 px-2 py-1 rounded">Next Week</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Fourth Row: Blocked Tasks Table & AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Blocked Tasks */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
          <h2 className="text-zinc-900 font-bold text-base mb-6 flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-500" /> Blocked Work
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="pb-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Task</th>
                  <th className="pb-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Owner</th>
                  <th className="pb-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Age</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <td className="py-3 font-semibold text-zinc-900">Payment API Integrations</td>
                  <td className="py-3 text-zinc-600 flex items-center gap-2"><User className="w-3 h-3"/> Mike R.</td>
                  <td className="py-3 text-red-600 font-bold text-right">3 Days</td>
                </tr>
                <tr className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <td className="py-3 font-semibold text-zinc-900">Auth Upgrade to v2</td>
                  <td className="py-3 text-zinc-600 flex items-center gap-2"><User className="w-3 h-3"/> Sarah K.</td>
                  <td className="py-3 text-red-600 font-bold text-right">2 Days</td>
                </tr>
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3 font-semibold text-zinc-900">Mobile Release Prep</td>
                  <td className="py-3 text-zinc-600 flex items-center gap-2"><User className="w-3 h-3"/> Alex M.</td>
                  <td className="py-3 text-amber-600 font-bold text-right">1 Day</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-indigo-900 font-bold text-base mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" /> AI Insights & Actions
          </h2>
          
          <div className="space-y-4 mb-6">
            <p className="text-sm text-indigo-900/80 leading-relaxed font-medium">
              <strong className="text-indigo-900 font-bold">Payment Gateway</strong> is projected to delay the release by 2 days. Backend utilization has exceeded target capacity for 3 consecutive sprints.
            </p>
            <p className="text-sm text-indigo-900/80 leading-relaxed font-medium">
              There is a <strong className="text-indigo-900 font-bold">78% probability</strong> of missing the v1.2.0 milestone unless immediate intervention occurs.
            </p>
          </div>
          
          <div className="mt-auto bg-white border border-indigo-100 rounded-xl p-4 shadow-sm">
            <span className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest block mb-2">Recommended Action</span>
            <div className="flex items-center justify-between">
              <span className="text-zinc-900 text-sm font-bold">Reallocate 1 engineer to Backend</span>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                Apply Change
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
