import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, type CreateProjectRequest } from '@/api/projects';
import { StandardModal } from '@/components/ui/StandardModal';
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
    projectCode: '',
  });

  const mutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onOpenChange(false);
      setFormData({ name: '', managerId: '', projectCode: '' });
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
    <StandardModal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Create New Project"
      primaryAction={{
        label: 'Create Project',
        onClick: () => mutation.mutate(formData),
        loading: mutation.isPending,
        disabled: !formData.name,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: () => onOpenChange(false),
      }}
    >
      <form id="create-project-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold text-zinc-900">Project Name <span className="text-red-500">*</span></label>
          <Input 
            id="name" 
            name="name"
            placeholder="e.g. Project Phoenix"
            value={formData.name} 
            onChange={handleChange} 
            className="bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-900 focus:border-zinc-900"
            required 
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="projectCode" className="text-sm font-bold text-zinc-900">Project Code</label>
          <Input 
            id="projectCode" 
            name="projectCode"
            placeholder="e.g. PHX (Leave empty to auto-generate)"
            value={formData.projectCode} 
            onChange={handleChange} 
            className="bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-900 focus:border-zinc-900"
            maxLength={10}
          />
          <p className="text-xs text-zinc-500">A short 3-4 letter identifier for this project.</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="managerId" className="text-sm font-bold text-zinc-900">Manager ID</label>
          <Input 
            id="managerId" 
            name="managerId"
            placeholder="e.g. USR-1"
            value={formData.managerId} 
            onChange={handleChange} 
            className="bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-900 focus:border-zinc-900"
          />
        </div>
      </form>
    </StandardModal>
  );
}
