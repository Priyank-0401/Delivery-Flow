import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { taskService, type TaskResponse } from '@/api/tasks';
import { Trash2 } from 'lucide-react';
import { graphService } from '@/features/graph/api/graph';

interface ManageDependenciesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskResponse | null;
  allTasks: TaskResponse[];
}

export function ManageDependenciesDialog({ open, onOpenChange, task, allTasks }: ManageDependenciesDialogProps) {
  const queryClient = useQueryClient();
  const [selectedTargetId, setSelectedTargetId] = useState('');

  // Fetch the project graph to see existing dependencies
  const { data: graphData, isLoading } = useQuery({
    queryKey: ['projectGraph', task?.projectId],
    queryFn: () => graphService.getProjectGraph(task!.projectId),
    enabled: !!task && !!task.projectId,
  });

  const addMutation = useMutation({
    mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
      taskService.addDependency(sourceId, targetId, 'BLOCKS'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectGraph', task?.projectId] });
      setSelectedTargetId('');
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
      taskService.removeDependency(sourceId, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectGraph', task?.projectId] });
    },
  });

  const handleAddDependency = () => {
    if (task && selectedTargetId) {
      addMutation.mutate({ sourceId: task.id, targetId: selectedTargetId });
    }
  };

  const handleRemoveDependency = (targetId: string) => {
    if (task) {
      removeMutation.mutate({ sourceId: task.id, targetId });
    }
  };

  if (!task) return null;

  // Filter out the current task from the available targets to prevent self-dependency
  const availableTasks = allTasks.filter(t => t.id !== task.id && t.projectId === task.projectId);

  // Find existing dependencies where this task is the source
  const existingDependencies = graphData?.edges.filter(e => e.source === task.id) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>Manage Dependencies: {task.taskKey}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-300">Add New Dependency (Blocks)</h3>
            <div className="flex gap-2">
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 rounded-md px-3 py-2 outline-none focus:border-primary"
              >
                <option value="">Select a task that this task blocks...</option>
                {availableTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.taskKey} - {t.title}</option>
                ))}
              </select>
              <Button 
                onClick={handleAddDependency} 
                disabled={!selectedTargetId || addMutation.isPending}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-300">Existing Dependencies</h3>
            {isLoading ? (
              <p className="text-sm text-zinc-500">Loading dependencies...</p>
            ) : existingDependencies.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">No dependencies found.</p>
            ) : (
              <ul className="space-y-2">
                {existingDependencies.map(dep => {
                  const targetTask = allTasks.find(t => t.id === dep.target);
                  return (
                    <li key={dep.id} className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded-md px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-400">{targetTask?.taskKey || dep.target}</span>
                        <span className="text-sm text-zinc-200">{targetTask?.title || 'Unknown Task'}</span>
                        <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded uppercase">{dep.type}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleRemoveDependency(dep.target)}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-800">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
