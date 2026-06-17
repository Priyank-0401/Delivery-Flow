import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, ShieldAlert, Zap, Timer, CheckCircle2, Ban } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sprintService, type SprintResponse } from '@/api/sprints';
import { CreateSprintDialog } from './CreateSprintDialog';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { InspectorPanel } from '@/components/ui/InspectorPanel';

export function SprintListPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<SprintResponse | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');

  const { data: sprints, isLoading, isError } = useQuery({
    queryKey: ['sprints'],
    queryFn: () => sprintService.getSprints(),
  });

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 shadow-sm">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-900">Error Loading Sprints</h3>
          <p className="text-sm font-medium mt-1">Ensure backend API is running.</p>
        </div>
      </div>
    );
  }

  const sortedSprints = [...(sprints || [])].sort((a, b) => {
    if (!a.endDate) return 1;
    if (!b.endDate) return -1;
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  });

  const columns = [
    {
      key: 'name',
      header: 'Sprint Name',
      cell: (item: SprintResponse) => (
        <div>
          <span className="font-bold text-zinc-900 block">{item.name}</span>
          <span className="font-mono text-zinc-500 font-bold text-[10px]">{item.sprintCode}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item: SprintResponse) => {
        const statusMap: Record<string, 'success' | 'info' | 'neutral'> = {
          ACTIVE: 'info', CLOSED: 'success', PLANNED: 'neutral'
        };
        return <StatusBadge status={statusMap[item.status || 'PLANNED']} label={item.status || 'PLANNED'} showIcon={item.status === 'ACTIVE'} />;
      },
      sortable: true
    },
    {
      key: 'timeline',
      header: 'Timeline',
      cell: (item: SprintResponse) => (
        <span className="text-sm text-zinc-600 font-medium flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          {item.startDate ? new Date(item.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'} - 
          {item.endDate ? new Date(item.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
        </span>
      )
    },
    {
      key: 'velocity',
      header: 'Completion',
      cell: (item: SprintResponse) => {
        const isClosed = item.status === 'CLOSED';
        const isActive = item.status === 'ACTIVE';
        const progress = isClosed ? 100 : isActive ? 74 : 0;
        return (
          <div className="flex items-center gap-3 w-32">
            <span className="text-xs font-bold text-zinc-700 w-8 text-right">{progress}%</span>
            <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${isClosed ? 'bg-emerald-500' : isActive ? 'bg-indigo-600' : 'bg-zinc-300'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-zinc-900">Sprints</h2>
          <p className="text-zinc-500 mt-2 font-medium text-sm">Manage delivery iterations and track team velocity.</p>
        </div>
        <Button 
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold shadow-sm px-4"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Sprint
        </Button>
      </div>

      {/* Active Sprint Summary Strip */}
      <div className="flex items-center gap-6 px-6 py-4 bg-white border border-zinc-200 rounded-xl shadow-sm mb-6 flex-shrink-0">
        <div className="flex items-center gap-3 border-r border-zinc-200 pr-6">
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Timer className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-sm font-black text-zinc-900">Current Sprint 4</div>
            <div className="text-xs font-bold text-indigo-600">ACTIVE</div>
          </div>
        </div>
        
        <div className="flex items-center gap-8 flex-1">
          <div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Completion</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-black text-zinc-900">74%</div>
              <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '74%' }}></div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Remaining</div>
            <div className="text-lg font-black text-zinc-900">3 Days</div>
          </div>

          <div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Blocked Work</div>
            <div className="text-lg font-black text-red-600 flex items-center gap-1.5">
              <Ban className="w-4 h-4" /> 2 Tasks
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Forecast</div>
            <div className="text-lg font-black text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> On Track
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 w-full bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col min-h-0">
          <DataTable 
            data={sortedSprints}
            columns={columns}
            onRowClick={(sprint) => setSelectedSprint(sprint)}
            activeRowId={selectedSprint?.id}
          />
        </div>
      )}

      {/* Inspector Panel */}
      <InspectorPanel
        open={!!selectedSprint}
        onClose={() => setSelectedSprint(null)}
        header={{
          title: selectedSprint?.name || 'Sprint Details',
          badge: selectedSprint?.sprintCode,
          status: <StatusBadge 
                    status={selectedSprint?.status === 'ACTIVE' ? 'info' : selectedSprint?.status === 'CLOSED' ? 'success' : 'neutral'} 
                    label={selectedSprint?.status || 'PLANNED'} 
                    showIcon={selectedSprint?.status === 'ACTIVE'}
                  />
        }}
        metadata={[
          {
            label: 'Start Date',
            value: selectedSprint?.startDate ? new Date(selectedSprint.startDate).toLocaleDateString() : 'TBD',
            icon: <Calendar className="w-4 h-4" />
          },
          {
            label: 'End Date',
            value: selectedSprint?.endDate ? new Date(selectedSprint.endDate).toLocaleDateString() : 'TBD',
            icon: <Calendar className="w-4 h-4" />
          }
        ]}
        tabs={['Overview', 'Tasks', 'Report']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        footerActions={{
          primary: { label: selectedSprint?.status === 'ACTIVE' ? 'Complete Sprint' : 'Start Sprint', onClick: () => {}, icon: <Zap className="w-4 h-4" /> },
          secondary: { label: 'Edit Settings', onClick: () => {} }
        }}
      >
        {selectedSprint && activeTab === 'Overview' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-900">Sprint Goal</h3>
            <div className="text-sm font-medium text-zinc-600 leading-relaxed italic border-l-2 border-indigo-200 pl-4 py-1">
              {(selectedSprint as any).goal || "No specific goal defined for this sprint."}
            </div>
            
            <h3 className="text-xs font-bold text-zinc-900 mt-6">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
               <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                 <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Points</div>
                 <div className="text-lg font-black text-zinc-900">42</div>
               </div>
               <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                 <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Completed</div>
                 <div className="text-lg font-black text-emerald-600">31</div>
               </div>
            </div>
          </div>
        )}
      </InspectorPanel>

      <CreateSprintDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}
