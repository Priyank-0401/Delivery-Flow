import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { RiskBadge, type RiskLevel } from '@/components/shared/RiskBadge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  manager: string;
  health: number;
  risk: RiskLevel;
  status: string;
}

export function ProjectListPage() {
  const rowData: Project[] = [
    { id: 'PRJ-101', name: 'Project Phoenix', manager: 'Sarah Jenkins', health: 92, risk: 'LOW', status: 'On Track' },
    { id: 'PRJ-102', name: 'Apollo Migration', manager: 'David Chen', health: 75, risk: 'MEDIUM', status: 'At Risk' },
    { id: 'PRJ-103', name: 'Payment Gateway v2', manager: 'Emma Watson', health: 45, risk: 'HIGH', status: 'Delayed' },
    { id: 'PRJ-104', name: 'Mobile App Redesign', manager: 'Michael Chang', health: 15, risk: 'CRITICAL', status: 'Blocked' },
    { id: 'PRJ-105', name: 'Data Lake Expansion', manager: 'Sarah Jenkins', health: 88, risk: 'LOW', status: 'On Track' },
  ];

  const columnDefs: ColDef<Project>[] = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Project Name', flex: 1 },
    { field: 'manager', headerName: 'Delivery Manager', flex: 1 },
    { field: 'status', headerName: 'Status', width: 150 },
    { 
      field: 'health', 
      headerName: 'Health', 
      width: 120,
      cellRenderer: (params: any) => {
        const val = params.value;
        const color = val >= 80 ? 'text-emerald-500' : val >= 50 ? 'text-amber-500' : 'text-red-500';
        return <span className={`font-bold ${color}`}>{val}/100</span>;
      }
    },
    { 
      field: 'risk', 
      headerName: 'Risk Level', 
      width: 150,
      cellRenderer: (params: any) => <RiskBadge level={params.value as RiskLevel} />
    }
  ], []);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Projects</h2>
          <p className="text-muted-foreground">Manage your delivery portfolio.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="flex-1 w-full mt-4 bg-zinc-950 border border-border rounded-md overflow-hidden">
        <div className="ag-theme-alpine-dark w-full h-[600px]">
          <AgGridReact
            rowData={rowData}
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
      </div>
    </div>
  );
}
