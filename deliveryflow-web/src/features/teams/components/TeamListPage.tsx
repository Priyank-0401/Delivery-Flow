import { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { teamService, type TeamResponse } from '@/api/teams';
import { CreateTeamDialog } from './CreateTeamDialog';

export function TeamListPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: teams, isLoading, isError } = useQuery({
    queryKey: ['teams'],
    queryFn: teamService.getTeams,
  });

  const columnDefs: ColDef<TeamResponse>[] = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 200 },
    { field: 'name', headerName: 'Team Name', flex: 1 },
    { field: 'teamType', headerName: 'Type', width: 150 },
    { field: 'capacity', headerName: 'Capacity', width: 150 },
    { field: 'createdAt', headerName: 'Created At', width: 200 }
  ], []);

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load teams. Ensure backend is running.</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Teams</h2>
          <p className="text-muted-foreground">Manage your delivery teams.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Team
        </Button>
      </div>

      <div className="flex-1 w-full mt-4 bg-zinc-950 border border-border rounded-md overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px] text-muted-foreground">Loading teams...</div>
        ) : (
          <div className="ag-theme-alpine-dark w-full h-[600px]">
            <AgGridReact
              theme="legacy"
              rowData={teams || []}
              columnDefs={columnDefs}
              rowSelection="single"
              animateRows={true}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
              }}
            />
          </div>
        )}
      </div>

      <CreateTeamDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}
