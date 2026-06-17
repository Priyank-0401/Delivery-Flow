import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Cpu, ShieldAlert, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { teamService, type TeamResponse } from '@/api/teams';
import { CreateTeamDialog } from './CreateTeamDialog';

export function TeamListPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: teams, isLoading, isError } = useQuery({
    queryKey: ['teams'],
    queryFn: teamService.getTeams,
  });

  if (isError) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold">Error Loading Teams</h3>
          <p className="text-sm">Ensure backend API is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">Teams</h2>
          <p className="text-zinc-400 mt-1 uppercase text-xs tracking-widest font-bold">Manage delivery teams and track capacity utilization.</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Team
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams?.map((team: TeamResponse, idx) => {
            // Mock utilization data for visual redesign
            // In a real app, this comes from analytics/teamService
            const mockUtils = [135, 82, 45, 95, 60];
            const util = mockUtils[idx % mockUtils.length];
            const isOverloaded = util > 100;
            const isHealthy = util >= 70 && util <= 100;

            const barColor = isOverloaded ? 'bg-red-500' : isHealthy ? 'bg-emerald-500' : 'bg-blue-500';
            const textColor = isOverloaded ? 'text-red-400' : isHealthy ? 'text-emerald-400' : 'text-blue-400';

            return (
              <div 
                key={team.id} 
                className="bg-[#131720] border border-zinc-800/50 hover:border-zinc-700 transition-all rounded-xl p-6 shadow-lg flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <Users className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg leading-none mb-1.5">{team.name}</h3>
                      <span className="font-mono text-[10px] text-zinc-400 font-black uppercase tracking-widest">{team.teamType}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#0B0E14] border border-zinc-800/50 p-4 rounded-xl flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Capacity</span>
                    <span className="text-xl font-black text-white">{team.capacity} <span className="text-xs text-zinc-400 font-bold uppercase">hrs</span></span>
                  </div>
                  <div className="bg-[#0B0E14] border border-zinc-800/50 p-4 rounded-xl flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Cpu className="w-3 h-3" /> Status</span>
                    <span className={`text-xs font-bold uppercase tracking-widest ${textColor}`}>
                      {isOverloaded ? 'Overloaded' : isHealthy ? 'Optimal' : 'Available'}
                    </span>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" /> Utilization
                    </span>
                    <span className={`text-xs font-bold ${textColor}`}>
                      {util}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50 relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                      style={{ width: `${Math.min(util, 100)}%`, filter: `drop-shadow(0 0 8px ${barColor}80)` }}
                    />
                    {/* Overload indicator segment */}
                    {isOverloaded && (
                      <div 
                        className="absolute right-0 top-0 h-full bg-red-600/50 w-full"
                        style={{ left: '100%', width: `${Math.min(util - 100, 100)}%`, transform: 'translateX(-100%)' }}
                      />
                    )}
                  </div>
                </div>

              </div>
            );
          })}

          {(!teams || teams.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-xl bg-[#131720]/50">
              <span className="text-zinc-300 font-bold mb-2">No teams configured.</span>
              <Button variant="outline" className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-zinc-200 uppercase tracking-widest text-xs font-bold" onClick={() => setIsCreateOpen(true)}>
                Configure First Team
              </Button>
            </div>
          )}
        </div>
      )}

      <CreateTeamDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}
