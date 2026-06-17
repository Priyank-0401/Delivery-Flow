import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ShieldAlert, Activity, AlertTriangle, Calendar, User, Timer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { projectService, type ProjectResponse } from '@/api/projects';
import { CreateProjectDialog } from './CreateProjectDialog';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { InspectorPanel } from '@/components/ui/InspectorPanel';

export function ProjectListPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');

  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 shadow-sm">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-900">Error Loading Projects</h3>
          <p className="text-sm font-medium mt-1">Ensure backend API is running.</p>
        </div>
      </div>
    );
  }

  const columns = [
    { 
      key: 'name', 
      header: 'Project Name', 
      cell: (item: ProjectResponse) => (
        <div>
          <span className="font-bold text-zinc-900 block">{item.name}</span>
          <span className="font-mono text-zinc-500 font-bold text-[10px]">{item.projectCode}</span>
        </div>
      ), 
      sortable: true 
    },
    {
      key: 'manager',
      header: 'Owner',
      cell: (item: ProjectResponse) => (
        <div className="flex items-center gap-2 text-zinc-600 font-medium">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px] border border-indigo-200">
            MR
          </div>
          <span className="text-sm font-semibold">Mike R.</span>
        </div>
      )
    },
    {
      key: 'progress',
      header: 'Progress',
      cell: (item: ProjectResponse) => {
        const progress = Math.floor(Math.random() * 40) + 40; // mock 40-80%
        return (
          <div className="w-32">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-zinc-700">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'sprint',
      header: 'Active Sprint',
      cell: (item: ProjectResponse) => (
        <span className="text-xs font-bold bg-zinc-100 text-zinc-700 px-2 py-1 rounded">Sprint 4</span>
      )
    },
    { 
      key: 'health', 
      header: 'Health', 
      cell: (item: ProjectResponse) => {
        const score = item.health || 100;
        return (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${score >= 85 ? 'bg-success' : score >= 60 ? 'bg-warning' : 'bg-danger'}`}></span>
            <span className={`font-bold ${score >= 85 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
              {score}/100
            </span>
          </div>
        );
      },
      sortable: true
    },
    { 
      key: 'status', 
      header: 'Status', 
      cell: (item: ProjectResponse) => {
        const score = item.health || 100;
        const status = score >= 85 ? 'HEALTHY' : score >= 60 ? 'AT_RISK' : 'CRITICAL';
        const statusMap: Record<string, 'success' | 'warning' | 'danger'> = {
          HEALTHY: 'success', AT_RISK: 'warning', CRITICAL: 'danger'
        };
        // Use more aggressive styling if critical
        if (status === 'CRITICAL') {
          return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-red-600 text-white shadow-sm"><ShieldAlert className="w-3 h-3" /> Critical</span>;
        }
        return <StatusBadge status={statusMap[status]} label={status} />;
      }
    }
  ];

  const getHealthLevel = (score: number) => score < 60 ? 'CRITICAL' : score < 85 ? 'AT RISK' : 'HEALTHY';
  const getHealthStatus = (score: number) => {
    const level = getHealthLevel(score);
    if (level === 'CRITICAL') {
      return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-red-600 text-white"><ShieldAlert className="w-3 h-3" /> Critical</span>;
    }
    return <StatusBadge status={level === 'AT RISK' ? 'warning' : 'success'} label={level} showIcon />;
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-zinc-900">Projects</h2>
          <p className="text-zinc-500 mt-2 font-medium text-sm">Manage your delivery portfolio.</p>
        </div>
        <Button 
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold shadow-sm px-4"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 w-full bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col min-h-0">
          <DataTable 
            data={projects || []}
            columns={columns}
            onRowClick={(p) => setSelectedProject(p)}
            activeRowId={selectedProject?.id}
          />
        </div>
      )}

      {/* Inspector Panel */}
      <InspectorPanel
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        header={{
          title: selectedProject?.name || 'Project Details',
          badge: selectedProject?.projectCode,
          status: getHealthStatus(selectedProject?.health || 100)
        }}
        metadata={[
          {
            label: 'Health Score',
            value: <span className={(selectedProject?.health || 100) >= 85 ? 'text-emerald-600' : (selectedProject?.health || 100) >= 60 ? 'text-amber-600' : 'text-red-600'}>{selectedProject?.health || 100}</span>,
            icon: <Activity className="w-5 h-5" />
          },
          {
            label: 'Active Sprint',
            value: 'Sprint 4',
            icon: <Timer className="w-5 h-5" />
          }
        ]}
        tabs={['Overview', 'Dependencies', 'Activity']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        aiInsights={(selectedProject?.health || 100) < 60 ? {
          problem: "Multiple tasks blocked in payment integration.",
          impact: "Release forecast delayed by 1 week.",
          recommendation: "Swarm payment integration tickets with senior backend engineers.",
          confidence: 85
        } : undefined}
        footerActions={{
          primary: { label: 'Open Workspace', onClick: () => {} },
          secondary: { label: 'Edit Settings', onClick: () => {} }
        }}
      >
        {selectedProject && activeTab === 'Overview' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-900">Description</h3>
            <div className="text-sm font-medium text-zinc-600 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              {(selectedProject as any).description || "No description provided for this project."}
            </div>
            
            <h3 className="text-xs font-bold text-zinc-900 mt-6">Project Owner</h3>
            <div className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                MR
              </div>
              <div>
                <div className="font-bold text-zinc-900 text-sm">Mike R.</div>
                <div className="text-xs font-medium text-zinc-500">Engineering Manager</div>
              </div>
            </div>
          </div>
        )}
      </InspectorPanel>

      <CreateProjectDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}
