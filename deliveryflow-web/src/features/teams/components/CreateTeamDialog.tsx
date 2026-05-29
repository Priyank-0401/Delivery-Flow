import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService, type CreateTeamRequest } from '@/api/teams';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateTeamRequest>({
    name: '',
    description: '',
    teamType: 'SCRUM',
    capacity: 100,
  });

  const mutation = useMutation({
    mutationFn: teamService.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      onOpenChange(false);
      setFormData({ name: '', description: '', teamType: 'SCRUM', capacity: 100 });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'capacity' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Team Name</label>
            <Input 
              id="name" 
              name="name"
              value={formData.name} 
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
              value={formData.description} 
              onChange={handleChange} 
              className="bg-zinc-900 border-zinc-800"
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="teamType" className="text-sm font-medium">Team Type</label>
              <select
                id="teamType"
                name="teamType"
                value={formData.teamType}
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="SCRUM">Scrum</option>
                <option value="KANBAN">Kanban</option>
                <option value="SUPPORT">Support</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="capacity" className="text-sm font-medium">Capacity (Pts)</label>
              <Input 
                id="capacity" 
                name="capacity"
                type="number"
                value={formData.capacity} 
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
              {mutation.isPending ? 'Creating...' : 'Create Team'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
