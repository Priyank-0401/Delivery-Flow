import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService, type CreateTeamRequest } from '@/api/teams';
import { StandardModal } from '@/components/ui/StandardModal';
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

  const handleSubmit = () => {
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'capacity' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <StandardModal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Create New Team"
      primaryAction={{
        label: 'Create Team',
        onClick: handleSubmit,
        loading: mutation.isPending,
        disabled: !formData.name || !formData.description,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: () => onOpenChange(false),
      }}
    >
      <form id="create-team-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold text-zinc-900">Team Name <span className="text-red-500">*</span></label>
          <Input 
            id="name" 
            name="name"
            placeholder="e.g. Phoenix Backend Core"
            value={formData.name} 
            onChange={handleChange} 
            className="bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-900 focus:border-zinc-900"
            required 
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-bold text-zinc-900">Description <span className="text-red-500">*</span></label>
          <Input 
            id="description" 
            name="description"
            placeholder="e.g. Handles core infrastructure and payments."
            value={formData.description} 
            onChange={handleChange} 
            className="bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-900 focus:border-zinc-900"
            required 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="teamType" className="text-sm font-bold text-zinc-900">Team Type</label>
            <select
              id="teamType"
              name="teamType"
              value={formData.teamType}
              onChange={handleChange}
              className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:border-zinc-900"
            >
              <option value="SCRUM">Scrum</option>
              <option value="KANBAN">Kanban</option>
              <option value="SUPPORT">Support</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="capacity" className="text-sm font-bold text-zinc-900">Capacity (Pts)</label>
            <Input 
              id="capacity" 
              name="capacity"
              type="number"
              value={formData.capacity} 
              onChange={handleChange} 
              className="bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-900 focus:border-zinc-900"
              required 
            />
          </div>
        </div>
      </form>
    </StandardModal>
  );
}
