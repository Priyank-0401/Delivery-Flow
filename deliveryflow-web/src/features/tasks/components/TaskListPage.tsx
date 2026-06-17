import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Network, Clock, BarChart4, AlertCircle, List as ListIcon, LayoutGrid, CheckCircle2, Search, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { taskService, type TaskResponse } from '@/api/tasks';
import { CreateTaskDialog } from './CreateTaskDialog';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { InspectorPanel } from '@/components/ui/InspectorPanel';
import { Link } from 'react-router-dom';

const STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED', 'DONE'];

const statusConfig: Record<string, { label: string; color: string; border: string }> = {
  TODO: { label: 'TODO', color: 'bg-zinc-100 text-zinc-600', border: 'border-zinc-200' },
  IN_PROGRESS: { label: 'IN PROGRESS', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
  REVIEW: { label: 'REVIEW', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
  BLOCKED: { label: 'BLOCKED', color: 'bg-red-50 text-red-600', border: 'border-red-100' },
  DONE: { label: 'DONE', color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
};

type ViewMode = 'list' | 'kanban';

export function TaskListPage() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('task_view_mode') as ViewMode) || 'list';
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Tasks');
  
  // Drawer state
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    localStorage.setItem('task_view_mode', viewMode);
  }, [viewMode]);

  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getTasks(),
  });

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    if (activeFilter === 'My Tasks') {
      return tasks.filter((_, i) => i % 3 === 0); // Mock filter
    }
    if (activeFilter === 'Blocked') {
      return tasks.filter(t => t.status === 'BLOCKED');
    }
    return tasks;
  }, [tasks, activeFilter]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, TaskResponse[]> = {
      TODO: [], IN_PROGRESS: [], REVIEW: [], BLOCKED: [], DONE: []
    };
    filteredTasks.forEach(task => {
      const s = task.status || 'TODO';
      if (!grouped[s]) grouped[s] = [];
      grouped[s].push(task);
    });
    return grouped;
  }, [filteredTasks]);

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 shadow-sm">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-900">Error Loading Tasks</h3>
          <p className="text-sm font-medium mt-1">Ensure backend API is running.</p>
        </div>
      </div>
    );
  }

  const columns = [
    { 
      key: 'taskKey', 
      header: 'ID', 
      cell: (item: TaskResponse) => <span className="font-mono text-zinc-500 font-bold text-xs">{item.taskKey}</span> 
    },
    { 
      key: 'title', 
      header: 'Task Name', 
      cell: (item: TaskResponse) => <span className="font-bold text-zinc-900 line-clamp-1">{item.title}</span>, 
      sortable: true 
    },
    { 
      key: 'status', 
      header: 'Status', 
      cell: (item: TaskResponse) => {
        const statusMap: Record<string, 'neutral' | 'info' | 'warning' | 'danger' | 'success'> = {
          TODO: 'neutral', IN_PROGRESS: 'info', REVIEW: 'warning', BLOCKED: 'danger', DONE: 'success'
        };
        return <StatusBadge status={statusMap[item.status || 'TODO']} label={item.status || 'TODO'} showIcon />;
      }
    },
    { 
      key: 'priority', 
      header: 'Priority', 
      cell: (item: TaskResponse) => (
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase tracking-widest ${
          item.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-100' :
          item.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
          item.priority === 'MEDIUM' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
          'bg-zinc-100 text-zinc-600 border border-zinc-200'
        }`}>
          {item.priority || 'LOW'}
        </span>
      ),
      sortable: true
    },
    {
      key: 'estimates',
      header: 'Effort',
      cell: (item: TaskResponse) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-zinc-500 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" /> {item.estimatedHours || 0}h
          </div>
          <div className="flex items-center gap-1 text-zinc-500 text-xs font-semibold">
            <BarChart4 className="w-3.5 h-3.5" /> {item.storyPoints || 0}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-zinc-900">Tasks</h2>
          <p className="text-zinc-500 mt-2 font-medium text-sm">Manage and prioritize project deliverables.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold shadow-sm px-4"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        {/* Quick Filters */}
        <div className="flex items-center bg-zinc-100/50 p-1 rounded-lg border border-zinc-200">
          {['All Tasks', 'My Tasks', 'Blocked'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                activeFilter === filter ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-700 border border-transparent'
              }`}
            >
              {filter}
            </button>
          ))}
          <div className="w-px h-4 bg-zinc-300 mx-2"></div>
          <button className="px-3 py-1.5 text-zinc-500 hover:text-zinc-700 font-bold text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" /> More Filters
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-lg border border-zinc-200">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${
              viewMode === 'list' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <ListIcon className="w-4 h-4" /> List
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${
              viewMode === 'kanban' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Board
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === 'list' ? (
        <div className="flex-1 w-full bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col min-h-0">
          <DataTable 
            data={filteredTasks} 
            columns={columns} 
            onRowClick={(task) => setSelectedTask(task)}
            activeRowId={selectedTask?.id}
            enableBulkSelect
          />
        </div>
      ) : (
        /* Kanban Board Area */
        <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4 -mx-2 px-2 min-h-0">
          <div className="flex h-full gap-4 min-w-max">
            {STATUSES.map(status => {
              const columnTasks = tasksByStatus[status] || [];
              const config = statusConfig[status];

              return (
                <div key={status} className="flex flex-col w-[320px] h-full bg-zinc-100/50 border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className={`p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50`}>
                    <h3 className="font-bold text-zinc-700 text-sm">{config.label}</h3>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${config.color} border ${config.border}`}>
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                    {columnTasks.map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => setSelectedTask(task)}
                        className={`bg-white border ${selectedTask?.id === task.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-zinc-200'} rounded-xl p-4 shadow-sm hover:shadow transition-all flex flex-col group cursor-pointer`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                            {task.taskKey}
                          </span>
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm uppercase tracking-widest ${
                            task.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-100' :
                            task.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                            task.priority === 'MEDIUM' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            'bg-zinc-100 text-zinc-600 border border-zinc-200'
                          }`}>
                            {task.priority || 'LOW'}
                          </span>
                        </div>
                        
                        <h4 className="text-sm font-bold text-zinc-900 mb-3 leading-snug line-clamp-2">
                          {task.title}
                        </h4>

                        <div className="flex items-center gap-4 mt-auto">
                          <div className="flex items-center gap-1.5 text-zinc-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">{task.estimatedHours || 0}h</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-500">
                            <BarChart4 className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">{task.storyPoints || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {columnTasks.length === 0 && (
                      <div className="h-24 flex items-center justify-center text-zinc-400 text-xs font-semibold uppercase tracking-widest border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                        Drop Tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Detail Inspector */}
      <InspectorPanel
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        header={{
          title: selectedTask?.title || 'Task Details',
          badge: selectedTask?.taskKey,
          status: <StatusBadge 
                    status={
                      selectedTask?.status === 'BLOCKED' ? 'danger' :
                      selectedTask?.status === 'DONE' ? 'success' :
                      selectedTask?.status === 'IN_PROGRESS' ? 'info' :
                      selectedTask?.status === 'REVIEW' ? 'warning' : 'neutral'
                    }
                    label={selectedTask?.status || 'TODO'}
                    showIcon
                  />
        }}
        metadata={[
          {
            label: 'Est. Hours',
            value: selectedTask?.estimatedHours || 0,
            icon: <Clock className="w-5 h-5" />
          },
          {
            label: 'Story Points',
            value: selectedTask?.storyPoints || 0,
            icon: <BarChart4 className="w-5 h-5" />
          }
        ]}
        tabs={['Overview', 'Dependencies', 'Activity']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        aiInsights={selectedTask?.status === 'BLOCKED' ? {
          problem: "Blocked by pending dependency.",
          impact: "Holding up 2 downstream tasks.",
          recommendation: "Ping owner of dependency task to escalate.",
          confidence: 90
        } : undefined}
        footerActions={{
          primary: { label: 'Mark Done', onClick: () => {}, icon: <CheckCircle2 className="w-4 h-4" /> },
          secondary: { label: 'Edit Task', onClick: () => {} }
        }}
      >
        {selectedTask && activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Description</h3>
              <div className="text-sm font-medium text-zinc-600 leading-relaxed whitespace-pre-wrap bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                {selectedTask.description || "No description provided for this task."}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Dependencies</h3>
              <div className="p-4 bg-white border border-zinc-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Network className="w-5 h-5 text-zinc-400" />
                  <span className="text-sm font-bold text-zinc-700">Visual dependency intelligence</span>
                </div>
                <Link to="/dependencies">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white border-zinc-200 text-zinc-900 font-bold shadow-sm"
                  >
                    Open Workspace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </InspectorPanel>

      <CreateTaskDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}
