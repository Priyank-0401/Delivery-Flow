import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService, type CreateTaskRequest } from '@/api/tasks';
import { sprintService } from '@/api/sprints';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const queryClient = useQueryClient();
  
  const { data: sprints } = useQuery({
    queryKey: ['sprints'],
    queryFn: () => sprintService.getSprints(),
  });

  const [formData, setFormData] = useState<CreateTaskRequest>({
    projectId: '',
    sprintId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    storyPoints: 5,
  });

  const mutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onOpenChange(false);
      setFormData({ ...formData, title: '', description: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sprintId) {
      alert('Please select a sprint');
      return;
    }
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'storyPoints' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // When a sprint is selected, auto-fill the projectId
  const handleSprintChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sprintId = e.target.value;
    const selectedSprint = sprints?.find(s => s.id === sprintId);
    setFormData({ 
      ...formData, 
      sprintId, 
      projectId: selectedSprint?.projectId || '' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="sprintId" className="text-sm font-medium">Sprint</label>
            <select
              id="sprintId"
              name="sprintId"
              value={formData.sprintId}
              onChange={handleSprintChange}
              className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="" disabled>Select a Sprint</option>
              {sprints?.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input 
              id="title" 
              name="title"
              placeholder="e.g. Implement login flow"
              value={formData.title} 
              onChange={handleChange} 
              className="bg-zinc-900 border-zinc-800"
              required 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Input 
              id="description" 
              name="description"
              placeholder="Brief description"
              value={formData.description} 
              onChange={handleChange} 
              className="bg-zinc-900 border-zinc-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="storyPoints" className="text-sm font-medium">Story Points</label>
              <Input 
                id="storyPoints" 
                name="storyPoints"
                type="number"
                value={formData.storyPoints} 
                onChange={handleChange} 
                className="bg-zinc-900 border-zinc-800"
                required 
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-800">
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
