import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sprintService, type CreateSprintRequest } from '@/api/sprints';
import { projectService } from '@/api/projects';
import { StandardModal } from '@/components/ui/StandardModal';
import { Input } from '@/components/ui/input';

interface CreateSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSprintDialog({ open, onOpenChange }: CreateSprintDialogProps) {
  const queryClient = useQueryClient();
  
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  const [formData, setFormData] = useState<CreateSprintRequest>({
    projectId: '',
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
  });

  const mutation = useMutation({
    mutationFn: sprintService.createSprint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      onOpenChange(false);
      setFormData({ ...formData, name: '' });
    },
  });

  const handleSubmit = () => {
    if (!formData.projectId) {
      alert('Please select a project');
      return;
    }
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <StandardModal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Create New Sprint"
      primaryAction={{
        label: 'Create Sprint',
        onClick: handleSubmit,
        loading: mutation.isPending,
        disabled: !formData.projectId || !formData.name,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: () => onOpenChange(false),
      }}
    >
      <form id="create-sprint-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="projectId" className="text-sm font-bold text-zinc-900">Project <span className="text-red-500">*</span></label>
          <select
            id="projectId"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:border-zinc-900"
            required
          >
            <option value="" disabled>Select a Project</option>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold text-zinc-900">Sprint Name <span className="text-red-500">*</span></label>
          <Input 
            id="name" 
            name="name"
            placeholder="e.g. Sprint 42"
            value={formData.name} 
            onChange={handleChange} 
            className="bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-900 focus:border-zinc-900"
            required 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="startDate" className="text-sm font-bold text-zinc-900">Start Date <span className="text-red-500">*</span></label>
            <Input 
              id="startDate" 
              name="startDate"
              type="date"
              value={formData.startDate} 
              onChange={handleChange} 
              className="bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-900 focus:border-zinc-900"
              required 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="endDate" className="text-sm font-bold text-zinc-900">End Date <span className="text-red-500">*</span></label>
            <Input 
              id="endDate" 
              name="endDate"
              type="date"
              value={formData.endDate} 
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
