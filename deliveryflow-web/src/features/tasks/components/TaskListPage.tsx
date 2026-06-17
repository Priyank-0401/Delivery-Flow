import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Network, Clock, BarChart4, AlertCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService, type TaskResponse } from '@/api/tasks';
import { CreateTaskDialog } from './CreateTaskDialog';
import { ManageDependenciesDialog } from './ManageDependenciesDialog';

const STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED', 'DONE'];

const statusConfig: Record<string, { label: string; color: string; border: string }> = {
  TODO: { label: 'TODO', color: 'bg-zinc-800 text-zinc-300', border: 'border-zinc-700/50' },
  IN_PROGRESS: { label: 'IN PROGRESS', color: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/20' },
  REVIEW: { label: 'REVIEW', color: 'bg-amber-500/10 text-amber-400', border: 'border-amber-500/20' },
  BLOCKED: { label: 'BLOCKED', color: 'bg-red-500/10 text-red-400', border: 'border-red-500/20' },
  DONE: { label: 'DONE', color: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/20' },
};

export function TaskListPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isManageDepsOpen, setIsManageDepsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);

  const queryClient = useQueryClient();

  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getTasks(),
  });

  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, TaskResponse[]> = {
      TODO: [], IN_PROGRESS: [], REVIEW: [], BLOCKED: [], DONE: []
    };
    if (tasks) {
      tasks.forEach(task => {
        const s = task.status || 'TODO';
        if (!grouped[s]) grouped[s] = [];
        grouped[s].push(task);
      });
    }
    return grouped;
  }, [tasks]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      // Invalidate to refresh tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  if (isError) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold">Error Loading Tasks</h3>
          <p className="text-sm">Ensure backend API is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">Tasks Board</h2>
          <p className="text-zinc-400 mt-1 uppercase text-xs tracking-widest font-bold">Manage delivery tasks across your portfolio.</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Kanban Board Area */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4">
          <div className="flex h-full gap-6 min-w-max">
            {STATUSES.map(status => {
              const columnTasks = tasksByStatus[status] || [];
              const config = statusConfig[status];

              return (
                <div key={status} className="flex flex-col w-80 h-full bg-[#0B0E14] border border-zinc-800/80 rounded-xl overflow-hidden shadow-inner">
                  {/* Column Header */}
                  <div className={`p-4 border-b ${config.border} flex items-center justify-between bg-[#131720]`}>
                    <h3 className="font-bold text-white text-sm uppercase tracking-widest">{config.label}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.color} border ${config.border}`}>
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Column Tasks */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                    {columnTasks.map(task => (
                      <div key={task.id} className="bg-[#131720] border border-zinc-800 rounded-lg p-4 shadow-md hover:border-zinc-700 transition-colors flex flex-col group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                            {task.taskKey}
                          </span>
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm uppercase tracking-widest ${
                            task.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                            task.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-400' :
                            task.priority === 'MEDIUM' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {task.priority || 'LOW'}
                          </span>
                        </div>
                        
                        <h4 className="text-sm font-bold text-white mb-3 leading-snug line-clamp-2">
                          {task.title}
                        </h4>

                        <div className="flex items-center gap-4 mt-auto mb-4 border-t border-zinc-800/50 pt-3">
                          <div className="flex items-center gap-1.5 text-zinc-300" title="Estimated Hours">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-mono font-bold">{task.estimatedHours || 0}h</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-300" title="Story Points">
                            <BarChart4 className="w-3.5 h-3.5" />
                            <span className="text-xs font-mono font-bold">{task.storyPoints || 0}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 justify-between">
                          <select
                            value={task.status || 'TODO'}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className={`text-[10px] font-bold px-2 py-1 rounded outline-none cursor-pointer uppercase tracking-widest appearance-none text-center ${config.color} border ${config.border} bg-[#0B0E14] hover:bg-opacity-80 transition-all`}
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s} className="bg-zinc-900 text-zinc-300">
                                {s.replace('_', ' ')}
                              </option>
                            ))}
                          </select>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] uppercase tracking-widest font-bold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsManageDepsOpen(true);
                            }}
                          >
                            <Network className="w-3 h-3 mr-1" /> Deps
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {columnTasks.length === 0 && (
                      <div className="h-24 flex items-center justify-center text-zinc-600 text-xs font-medium uppercase tracking-widest border-2 border-dashed border-zinc-800/50 rounded-lg">
                        Empty
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <CreateTaskDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />

      <ManageDependenciesDialog
        open={isManageDepsOpen}
        onOpenChange={setIsManageDepsOpen}
        task={selectedTask}
        allTasks={tasks || []}
      />
    </div>
  );
}
