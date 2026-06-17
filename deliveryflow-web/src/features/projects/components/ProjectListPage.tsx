import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, TrendingDown, TrendingUp, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { projectService, type ProjectResponse } from '@/api/projects';
import { CreateProjectDialog } from './CreateProjectDialog';

export function ProjectListPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  if (isError) {
    return <div className="p-6 text-red-500 font-medium">Failed to load projects. Ensure backend is running.</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Projects</h2>
          <p className="text-zinc-500 mt-1">Manage your delivery portfolio.</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-zinc-500">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects?.map((project: ProjectResponse) => {
            // Placeholder logic for visual metrics
            const score = project.health || 78;
            const isCritical = score < 60;
            const isAtRisk = score >= 60 && score < 85;
            const isHealthy = score >= 85;

            return (
              <div 
                key={project.id} 
                className="bg-[#131720] border border-zinc-800/50 rounded-xl p-5 hover:border-zinc-700 transition-colors cursor-pointer flex flex-col shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{project.name}</h3>
                    <span className="font-mono text-xs text-zinc-500 font-semibold uppercase">{project.projectCode}</span>
                  </div>
                </div>

                <div className="flex items-end gap-3 mb-6">
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 uppercase font-semibold mb-1">Health</span>
                    <span className={`text-4xl font-black tracking-tighter leading-none ${
                      isHealthy ? 'text-emerald-500' : isAtRisk ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {score}
                    </span>
                  </div>
                  <div className="flex flex-col pb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                      isHealthy ? 'bg-emerald-500/10 text-emerald-400' : isAtRisk ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {isHealthy ? 'Healthy' : isAtRisk ? 'At Risk' : 'Critical'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Critical Path Delay</span>
                    <span className={`font-bold ${isCritical ? 'text-red-400' : isAtRisk ? 'text-amber-400' : 'text-zinc-300'}`}>
                      {isCritical ? '+4 days' : isAtRisk ? '+2 days' : 'None'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Blocked Tasks</span>
                    <span className={`font-bold ${isCritical ? 'text-red-400' : isAtRisk ? 'text-amber-400' : 'text-zinc-300'}`}>
                      {isCritical ? '4' : isAtRisk ? '2' : '0'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Velocity Trend</span>
                    <span className={`font-bold flex items-center gap-1 ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isHealthy ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {isHealthy ? 'Stable' : 'Dropping'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {(!projects || projects.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-xl bg-[#131720]/50">
              <span className="text-zinc-400 font-medium mb-2">No projects found in this portfolio.</span>
              <Button variant="outline" className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-zinc-300" onClick={() => setIsCreateOpen(true)}>
                Create First Project
              </Button>
            </div>
          )}
        </div>
      )}

      <CreateProjectDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}
