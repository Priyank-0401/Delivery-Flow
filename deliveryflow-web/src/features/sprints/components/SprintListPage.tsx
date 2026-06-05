import { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sprintService, type SprintResponse } from '@/api/sprints';
import { CreateSprintDialog } from './CreateSprintDialog';

export function SprintListPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: sprints, isLoading, isError } = useQuery({
    queryKey: ['sprints'],
    queryFn: () => sprintService.getSprints(),
  });

  const columnDefs: ColDef<SprintResponse>[] = useMemo(() => [
    { 
      field: 'sprintCode', 
      headerName: 'Code', 
      width: 140,
      cellRenderer: (params: { value: string }) => {
        return (
          <span className="font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-xs font-semibold">
            {params.value || 'N/A'}
          </span>
        );
      }
    },
    { field: 'name', headerName: 'Sprint Name', flex: 1 },
    { field: 'projectId', headerName: 'Project ID', width: 200 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'startDate', headerName: 'Start Date', width: 150 },
    { field: 'endDate', headerName: 'End Date', width: 150 }
  ], []);

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load sprints. Ensure backend is running.</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Sprints</h2>
          <p className="text-muted-foreground">Manage your delivery sprints.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Sprint
        </Button>
      </div>

      <div className="flex-1 w-full mt-4 bg-zinc-950 border border-border rounded-md overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px] text-muted-foreground">Loading sprints...</div>
        ) : (
          <div className="ag-theme-alpine-dark w-full h-[600px]">
            <AgGridReact
              theme="legacy"
              rowData={sprints || []}
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

      <CreateSprintDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}
