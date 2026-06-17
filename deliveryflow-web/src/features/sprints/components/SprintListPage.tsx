import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Activity, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sprintService, type SprintResponse } from '@/api/sprints';
import { CreateSprintDialog } from './CreateSprintDialog';

export function SprintListPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: sprints, isLoading, isError } = useQuery({
    queryKey: ['sprints'],
    queryFn: () => sprintService.getSprints(),
  });

  if (isError) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
        <Activity className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold">Error Loading Sprints</h3>
          <p className="text-sm">Ensure backend API is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">Sprints</h2>
          <p className="text-zinc-400 mt-1 uppercase text-xs tracking-widest font-bold">Manage delivery sprints and velocity tracking.</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Sprint
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sprints?.map((sprint: SprintResponse) => {
            const isActive = sprint.status === 'ACTIVE';
            const isPlanned = sprint.status === 'PLANNED';
            const isClosed = sprint.status === 'CLOSED';

            return (
              <div 
                key={sprint.id} 
                className={`bg-[#131720] border rounded-xl p-5 shadow-lg flex flex-col transition-all ${
                  isActive ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-zinc-800/50 hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-xs text-zinc-400 font-black uppercase tracking-widest">{sprint.sprintCode}</span>
                  <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest ${
                    isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    isPlanned ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                    'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {sprint.status || 'UNKNOWN'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-6 leading-tight">{sprint.name}</h3>

                <div className="space-y-4 mt-auto">
                  <div className="flex items-center gap-3 text-sm text-zinc-300 bg-[#0B0E14] p-3 rounded-lg border border-zinc-800/50">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Timeline</span>
                      <span className="font-mono text-zinc-200 font-black text-xs">
                        {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'TBD'} - {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'TBD'}
                      </span>
                    </div>
                  </div>

                  {/* Mock Progress/Velocity Indicator */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" /> Projected Velocity
                      </span>
                      <span className="text-xs font-bold text-white">
                        {isActive ? '85%' : isClosed ? '100%' : '0%'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isActive ? 'bg-amber-500' : isClosed ? 'bg-emerald-500' : 'bg-zinc-700'
                        }`}
                        style={{ width: isActive ? '85%' : isClosed ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {(!sprints || sprints.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-xl bg-[#131720]/50">
              <span className="text-zinc-300 font-bold mb-2">No sprints found.</span>
              <Button variant="outline" className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-bold uppercase tracking-widest text-xs" onClick={() => setIsCreateOpen(true)}>
                Create First Sprint
              </Button>
            </div>
          )}
        </div>
      )}

      <CreateSprintDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}
