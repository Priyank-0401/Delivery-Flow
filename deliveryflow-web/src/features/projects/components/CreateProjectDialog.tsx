import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, type CreateProjectRequest } from '@/api/projects';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    managerId: '',
  });

  const mutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onOpenChange(false);
      setFormData({ name: '', managerId: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Project Name</label>
            <Input 
              id="name" 
              name="name"
              placeholder="e.g. Project Phoenix"
              value={formData.name} 
              onChange={handleChange} 
              className="bg-zinc-900 border-zinc-800"
              required 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="managerId" className="text-sm font-medium">Manager ID</label>
            <Input 
              id="managerId" 
              name="managerId"
              placeholder="e.g. USR-1"
              value={formData.managerId} 
              onChange={handleChange} 
              className="bg-zinc-900 border-zinc-800"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-800">
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
