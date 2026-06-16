import { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { taskService, type TaskResponse } from '@/api/tasks';
import { CreateTaskDialog } from './CreateTaskDialog';
import { ManageDependenciesDialog } from './ManageDependenciesDialog';

export function TaskListPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isManageDepsOpen, setIsManageDepsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);

  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getTasks(),
  });

  const columnDefs: ColDef<TaskResponse>[] = useMemo(() => [
    { 
      field: 'taskKey', 
      headerName: 'Key', 
      width: 120,
      cellRenderer: (params: { value: string }) => {
        return (
          <span className="font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-xs font-semibold">
            {params.value || 'N/A'}
          </span>
        );
      }
    },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'sprintId', headerName: 'Sprint ID', width: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      cellRenderer: (params: { data: TaskResponse; value: string; api: any; node: any }) => {
        return (
          <select 
            value={params.value || 'TODO'} 
            onChange={(e) => {
              taskService.updateTaskStatus(params.data.id, e.target.value)
                .then(() => {
                  params.data.status = e.target.value;
                  params.api?.refreshCells({ rowNodes: [params.node] });
                })
                .catch(err => alert('Failed to update status: ' + err.message));
            }}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded px-2 py-1 outline-none"
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="REVIEW">REVIEW</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="DONE">DONE</option>
          </select>
        );
      }
    },
    { field: 'priority', headerName: 'Priority', width: 120 },
    { field: 'storyPoints', headerName: 'Pts', width: 80 },
    { field: 'assigneeId', headerName: 'Assignee', width: 150 },
    {
      headerName: 'Actions',
      width: 150,
      cellRenderer: (params: { data: TaskResponse }) => {
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs bg-zinc-900 border-zinc-700"
            onClick={() => {
              setSelectedTask(params.data);
              setIsManageDepsOpen(true);
            }}
          >
            Dependencies
          </Button>
        );
      }
    }
  ], []);

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load tasks. Ensure backend is running.</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Tasks</h2>
          <p className="text-muted-foreground">Manage your delivery tasks and dependencies.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="flex-1 w-full mt-4 bg-zinc-950 border border-border rounded-md overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px] text-muted-foreground">Loading tasks...</div>
        ) : (
          <div className="ag-theme-alpine-dark w-full h-[600px]">
            <AgGridReact
              theme="legacy"
              rowData={tasks || []}
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

      <CreateTaskDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />

      <ManageDependenciesDialog
        open={isManageDepsOpen}
        onOpenChange={setIsManageDepsOpen}
        task={selectedTask}
        allTasks={tasks || []}
      />
    </div>
  );
}
