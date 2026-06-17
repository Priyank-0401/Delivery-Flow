import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import type { Node } from 'reactflow';
import 'reactflow/dist/style.css';

import { graphService } from '../api/graph';
import { AlertCircle, ShieldAlert, Clock, BarChart4, Inspect, Network, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/store/useProjectStore';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function DependencyMapPage() {
  const { selectedProjectId } = useProjectStore();
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null);

  const {
    data: graphData,
    isLoading: loadingGraph,
    error: graphError,
  } = useQuery({
    queryKey: ['projectGraph', selectedProjectId],
    queryFn: () => graphService.getProjectGraph(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  const { data: criticalPath, isLoading: loadingPath } = useQuery({
    queryKey: ['criticalPath', selectedProjectId],
    queryFn: () => graphService.getCriticalPath(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const layoutPositions = useMemo(() => {
    if (!graphData || !graphData.nodes) return {};

    const { nodes, edges } = graphData;
    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};

    nodes.forEach((n) => {
      adj[n.id] = [];
      inDegree[n.id] = 0;
    });

    edges.forEach((e) => {
      if (adj[e.source]) {
        adj[e.source].push(e.target);
        inDegree[e.target] = (inDegree[e.target] || 0) + 1;
      }
    });

    const levels: Record<string, number> = {};
    const queue: string[] = [];

    nodes.forEach((n) => {
      if (inDegree[n.id] === 0) {
        levels[n.id] = 0;
        queue.push(n.id);
      }
    });

    while (queue.length > 0) {
      const u = queue.shift()!;
      const currentLevel = levels[u] ?? 0;

      adj[u]?.forEach((v) => {
        levels[v] = Math.max(levels[v] ?? 0, currentLevel + 1);
        queue.push(v);
      });
    }

    nodes.forEach((n) => {
      if (levels[n.id] === undefined) {
        levels[n.id] = 0;
      }
    });

    const groups: Record<number, string[]> = {};
    nodes.forEach((n) => {
      const l = levels[n.id];
      if (!groups[l]) {
        groups[l] = [];
      }
      groups[l].push(n.id);
    });

    const positions: Record<string, { x: number; y: number }> = {};
    Object.keys(groups).forEach((lStr) => {
      const lvl = parseInt(lStr, 10);
      const groupNodes = groups[lvl];
      groupNodes.forEach((id, index) => {
        const spacing = 180;
        const totalHeight = (groupNodes.length - 1) * spacing;
        const y = 250 + (index * spacing - totalHeight / 2);
        const x = lvl * 320 + 100;
        positions[id] = { x, y };
      });
    });

    return positions;
  }, [graphData]);

  useEffect(() => {
    if (!graphData) return;

    const criticalNodeIds = new Set(criticalPath?.criticalPathTaskIds || []);

    const flowNodes = graphData.nodes.map((n) => {
      const pos = layoutPositions[n.id] || { x: 0, y: 0 };
      const isCritical = criticalNodeIds.has(n.id);
      const isBlocked = n.status === 'BLOCKED';

      const statusColor = 
        n.status === 'DONE' ? 'text-emerald-600' :
        n.status === 'IN_PROGRESS' ? 'text-blue-600' :
        n.status === 'BLOCKED' ? 'text-red-600' : 'text-zinc-600';

      return {
        id: n.id,
        position: pos,
        data: {
          ...n,
          isCritical,
          label: (
            <div className="flex flex-col w-full h-full justify-between p-1 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[10px] text-zinc-500 uppercase tracking-widest bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                  {n.taskKey || 'NO-KEY'}
                </span>
                {isBlocked && (
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <span className="font-bold text-zinc-900 text-left line-clamp-2 text-sm leading-tight mb-4">
                {n.label}
              </span>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-center border-t border-zinc-100 pt-2">
                  <span className="text-zinc-500 font-medium">Status</span>
                  <span className={`font-bold ${statusColor}`}>{n.status || 'TODO'}</span>
                </div>
              </div>
            </div>
          ),
        },
        style: {
          background: '#ffffff',
          border: isCritical ? '2px solid #ef4444' : '1px solid #e4e4e7',
          borderRadius: '12px',
          width: 220,
          padding: '12px',
          boxShadow: isCritical ? '0 4px 12px rgba(239, 68, 68, 0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
          cursor: 'pointer',
        },
      };
    });

    const flowEdges = graphData.edges.map((e) => {
      const isCritical = criticalNodeIds.has(e.source) && criticalNodeIds.has(e.target);

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        animated: isCritical,
        style: {
          stroke: isCritical ? '#ef4444' : '#a1a1aa', // darker line than original
          strokeWidth: isCritical ? 2.5 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCritical ? '#ef4444' : '#a1a1aa',
        },
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [graphData, criticalPath, layoutPositions, setNodes, setEdges]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeData(node.data);
  }, []);

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col h-full space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-zinc-900">Delivery Network</h2>
            <p className="text-zinc-500 font-medium tracking-wide mt-1 text-sm">Analyze critical path and task relationships.</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50 h-[calc(100vh-200px)]">
          <span className="text-zinc-500 font-semibold mb-3">No project selected.</span>
          <p className="text-zinc-400 text-sm">Select a project from the command palette to view its dependency graph.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Toolbar */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border border-zinc-200 rounded-xl shadow-sm">
              <Network className="w-5 h-5 text-zinc-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 leading-none">Dependency Map</h2>
              <p className="text-zinc-500 font-medium mt-1 text-xs">Interactive critical path visualization</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {criticalPath && (
            <div className="flex items-center gap-4 text-xs bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 font-semibold uppercase tracking-widest">Critical Path</span>
                <span className="text-zinc-900 font-bold">{criticalPath.criticalPathTaskIds.length} Nodes</span>
              </div>
              <div className="h-4 w-px bg-zinc-200"></div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 font-semibold uppercase tracking-widest">Duration</span>
                <span className="text-zinc-900 font-bold">{criticalPath.projectDuration}h</span>
              </div>
            </div>
          )}
          <Button 
            variant="outline"
            className="bg-white border-zinc-200 text-zinc-900 font-semibold shadow-sm text-sm h-9"
            onClick={() => window.location.reload()}
          >
            Reset Layout
          </Button>
        </div>
      </div>

      {/* Main Workspace: 15/65/20 Layout Simulation (15 is the sidebar outside this component) */}
      {/* We are the 85% area, so we split it into Left Panel (280px) / Graph / Inspector Panel (340px) */}
      <div className="flex-1 flex overflow-hidden border border-zinc-200 rounded-2xl shadow-sm bg-white">
        
        {/* Navigator Panel (Left Sidebar) */}
        <div className="w-[280px] border-r border-zinc-200 bg-white flex flex-col flex-shrink-0 relative z-10">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-400" />
            <h3 className="font-bold text-sm text-zinc-900">Map Layers & Filters</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Highlight Paths</h4>
              <label className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors">
                <input type="checkbox" className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600" defaultChecked />
                <span className="text-sm font-semibold text-zinc-700">Critical Path</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors">
                <input type="checkbox" className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600" defaultChecked={false} />
                <span className="text-sm font-semibold text-zinc-700">Blocked Chains</span>
              </label>
            </div>

            <div className="space-y-3 border-t border-zinc-100 pt-6">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Filter by Team</h4>
              <label className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors">
                <input type="checkbox" className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600" defaultChecked />
                <span className="text-sm font-semibold text-zinc-700">Backend</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors">
                <input type="checkbox" className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600" defaultChecked />
                <span className="text-sm font-semibold text-zinc-700">Frontend</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors">
                <input type="checkbox" className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600" defaultChecked />
                <span className="text-sm font-semibold text-zinc-700">Mobile</span>
              </label>
            </div>
            
            <div className="space-y-3 border-t border-zinc-100 pt-6">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Node Types</h4>
              <label className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors">
                <input type="checkbox" className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600" defaultChecked />
                <span className="text-sm font-semibold text-zinc-700">Tasks</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors">
                <input type="checkbox" className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600" defaultChecked />
                <span className="text-sm font-semibold text-zinc-700">Milestones</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Graph Area */}
        <div className="flex-1 relative bg-[#FAFAFA]">
          {loadingGraph || loadingPath ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : graphError ? (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="bg-red-50 border border-red-100 p-6 rounded-xl flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-1">Graph Connection Error</h3>
                  <p className="text-sm text-red-700">Failed to load relationship data.</p>
                </div>
              </div>
            </div>
          ) : !nodes || nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 font-medium">
              No tasks or relationships found
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
              minZoom={0.1}
              maxZoom={1.5}
            >
              <Background color="#e4e4e7" gap={20} size={1} />
              <Controls className="bg-white border border-zinc-200 rounded-lg text-zinc-900 shadow-sm" showInteractive={false} />
            </ReactFlow>
          )}
        </div>

        {/* Inspector Panel (Permanent Right Sidebar) */}
        <div className="w-[340px] xl:w-[400px] border-l border-zinc-200 bg-white flex flex-col flex-shrink-0 relative z-10">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-400" />
            <h3 className="font-bold text-sm text-zinc-900">Node Inspector</h3>
          </div>
          
          {selectedNodeData ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-zinc-500 font-semibold text-xs px-2 py-1 bg-zinc-100 rounded border border-zinc-200">
                    {selectedNodeData.taskKey}
                  </span>
                  {selectedNodeData.isCritical && (
                    <span className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold uppercase tracking-widest rounded">
                      Critical Path
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-zinc-900 leading-tight mb-4">{selectedNodeData.label}</h2>
                <StatusBadge 
                  status={selectedNodeData.status === 'BLOCKED' ? 'danger' : selectedNodeData.status === 'DONE' ? 'success' : selectedNodeData.status === 'IN_PROGRESS' ? 'info' : 'neutral'} 
                  label={selectedNodeData.status || 'TODO'} 
                  showIcon
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <Clock className="w-3 h-3" /> Est. Hours
                  </span>
                  <span className="text-lg font-black text-zinc-900">{selectedNodeData.estimatedHours || 0}</span>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <BarChart4 className="w-3 h-3" /> Story Points
                  </span>
                  <span className="text-lg font-black text-zinc-900">{selectedNodeData.storyPoints || 0}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Health Impact</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-2">
                    <span className="text-zinc-600 font-medium">Schedule Risk</span>
                    <span className={selectedNodeData.status === 'BLOCKED' ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {selectedNodeData.status === 'BLOCKED' ? 'High' : 'Low'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-2">
                    <span className="text-zinc-600 font-medium">Downstream Impact</span>
                    <span className="text-amber-600 font-bold">Medium</span>
                  </div>
                </div>
              </div>

              {selectedNodeData.isCritical && selectedNodeData.status === 'BLOCKED' && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Active Blocker</span>
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed font-medium">
                    This task is actively blocking the critical path. Every hour this remains blocked translates to a 1:1 delay in the final project delivery date.
                  </p>
                  <Button variant="outline" className="w-full mt-3 bg-white border-red-200 text-red-700 hover:bg-red-50 shadow-sm text-xs font-bold h-8">
                    Escalate Blocker
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50/50">
              <div className="p-4 bg-white border border-zinc-200 rounded-full mb-4 shadow-sm">
                <Inspect className="w-8 h-8 text-zinc-300" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1">No Node Selected</h3>
              <p className="text-xs text-zinc-500 font-medium">Click on any node in the dependency graph to inspect its details and metrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
