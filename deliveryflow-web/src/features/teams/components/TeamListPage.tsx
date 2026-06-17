import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, ShieldAlert, Cpu, Activity, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { teamService, type TeamResponse } from '@/api/teams';
import { CreateTeamDialog } from './CreateTeamDialog';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { InspectorPanel } from '@/components/ui/InspectorPanel';

export function TeamListPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamResponse | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');

  const { data: teams, isLoading, isError } = useQuery({
    queryKey: ['teams'],
    queryFn: teamService.getTeams,
  });

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 shadow-sm">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-900">Error Loading Teams</h3>
          <p className="text-sm font-medium mt-1">Ensure backend API is running.</p>
        </div>
      </div>
    );
  }

  // Mock utilization mapping based on ID for demo purposes
  const getUtilization = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const utils = [115, 82, 45, 95, 60, 105, 75, 90, 130];
    return utils[hash % utils.length];
  };

  const getStatus = (util: number) => {
    if (util > 100) return 'OVERLOADED';
    if (util >= 75) return 'OPTIMAL';
    return 'AVAILABLE';
  };

  const columns = [
    {
      key: 'name',
      header: 'Team Name',
      cell: (item: TeamResponse) => (
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-zinc-50 border border-zinc-200 rounded-md">
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
          <span className="font-bold text-zinc-900">{item.name}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'teamType',
      header: 'Type',
      cell: (item: TeamResponse) => <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{item.teamType}</span>,
      sortable: true
    },
    {
      key: 'capacity',
      header: 'Capacity',
      cell: (item: TeamResponse) => <span className="font-bold text-zinc-900">{item.capacity} <span className="text-xs text-zinc-500 font-bold uppercase">hrs</span></span>,
      sortable: true
    },
    {
      key: 'utilization',
      header: 'Utilization',
      cell: (item: TeamResponse) => {
        const util = getUtilization(item.id);
        const barColor = util > 100 ? 'bg-danger' : util >= 75 ? 'bg-success' : 'bg-info';
        return (
          <div className="flex items-center gap-4 w-48">
            <span className={`text-xs font-bold w-10 text-right ${util > 100 ? 'text-red-600' : 'text-zinc-700'}`}>{util}%</span>
            <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden relative">
              <div 
                className={`absolute top-0 left-0 h-full rounded-full ${barColor}`} 
                style={{ width: `${Math.min(util, 100)}%` }} 
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item: TeamResponse) => {
        const status = getStatus(getUtilization(item.id));
        const statusMap: Record<string, 'danger' | 'success' | 'info'> = {
          OVERLOADED: 'danger', OPTIMAL: 'success', AVAILABLE: 'info'
        };
        // Special aggressive styling for OVERLOADED
        if (status === 'OVERLOADED') {
           return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-red-600 text-white shadow-sm"><Activity className="w-3 h-3" /> Overloaded</span>;
        }
        return <StatusBadge status={statusMap[status]} label={status} showIcon />;
      }
    }
  ];

  const util = selectedTeam ? getUtilization(selectedTeam.id) : 0;
  const status = getStatus(util);

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-zinc-900">Teams</h2>
          <p className="text-zinc-500 mt-2 font-medium text-sm">Manage delivery teams and track capacity utilization.</p>
        </div>
        <Button 
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold shadow-sm px-4"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Team
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 w-full bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col min-h-0">
          <DataTable 
            data={teams || []}
            columns={columns}
            onRowClick={(team) => setSelectedTeam(team)}
            activeRowId={selectedTeam?.id}
          />
        </div>
      )}

      {/* Team Detail Inspector */}
      <InspectorPanel
        open={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        header={{
          title: selectedTeam?.name || 'Team Details',
          badge: selectedTeam?.teamType,
          status: status === 'OVERLOADED' 
                    ? <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-red-600 text-white"><Activity className="w-3 h-3" /> Overloaded</span>
                    : <StatusBadge status={status === 'OPTIMAL' ? 'success' : 'info'} label={status} showIcon />
        }}
        metadata={[
          {
            label: 'Weekly Capacity',
            value: `${selectedTeam?.capacity || 0}h`,
            icon: <Cpu className="w-5 h-5" />
          },
          {
            label: 'Current Utilization',
            value: <span className={util > 100 ? 'text-red-600' : 'text-emerald-600'}>{util}%</span>,
            icon: <Activity className="w-5 h-5" />
          }
        ]}
        tabs={['Overview', 'Members', 'Workload']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        aiInsights={util > 100 ? {
          problem: "Team has been operating above 100% capacity for multiple sprints.",
          impact: "High risk of burnout. Predictability of delivery has dropped by 14%.",
          recommendation: "Rebalance 2 active tasks to the 'Platform' team which has available capacity.",
          confidence: 92
        } : undefined}
        footerActions={{
          primary: { label: 'Add Members', onClick: () => {}, icon: <Users className="w-4 h-4" /> },
          secondary: { label: 'Manage Team', onClick: () => {} }
        }}
      >
        {selectedTeam && activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Active Members</h3>
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-500 font-medium flex items-center gap-3">
                <Users className="w-5 h-5 text-zinc-400" />
                Member management coming soon.
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Team Performance</h3>
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                   <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Velocity Trend</div>
                   <div className="text-lg font-black text-emerald-600">+12%</div>
                 </div>
                 <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                   <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Quality Score</div>
                   <div className="text-lg font-black text-zinc-900">98/100</div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </InspectorPanel>

      <CreateTeamDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}
