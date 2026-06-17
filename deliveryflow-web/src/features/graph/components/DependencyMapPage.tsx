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
import { AlertCircle, Play, Info, X, ShieldAlert, Clock, BarChart4 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/store/useProjectStore';

export function DependencyMapPage() {
  const { selectedProjectId } = useProjectStore();
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null);

  // (Projects fetch moved to global layout)

  // 2. Fetch Graph Data
  const {
    data: graphData,
    isLoading: loadingGraph,
    error: graphError,
  } = useQuery({
    queryKey: ['projectGraph', selectedProjectId],
    queryFn: () => graphService.getProjectGraph(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  // 3. Fetch Critical Path
  const { data: criticalPath, isLoading: loadingPath } = useQuery({
    queryKey: ['criticalPath', selectedProjectId],
    queryFn: () => graphService.getCriticalPath(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  // ReactFlow state management
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // BFS DAG layout algorithm
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

    // Handle any circular/disconnected nodes fallback
    nodes.forEach((n) => {
      if (levels[n.id] === undefined) {
        levels[n.id] = 0;
      }
    });

    // Group by level
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
        // Distribute vertically centered around y=250
        const spacing = 160;
        const totalHeight = (groupNodes.length - 1) * spacing;
        const y = 250 + (index * spacing - totalHeight / 2);
        const x = lvl * 320 + 100;
        positions[id] = { x, y };
      });
    });

    return positions;
  }, [graphData]);

  // Synchronize layout positions to ReactFlow nodes & edges
  useEffect(() => {
    if (!graphData) return;

    const criticalNodeIds = new Set(criticalPath?.criticalPathTaskIds || []);

    const flowNodes = graphData.nodes.map((n) => {
      const pos = layoutPositions[n.id] || { x: 0, y: 0 };
      const isCritical = criticalNodeIds.has(n.id);
      const isBlocked = n.status === 'BLOCKED';

      return {
        id: n.id,
        position: pos,
        data: {
          ...n,
          isCritical,
          label: (
            <div className="flex flex-col items-start text-xs p-2">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                  {n.taskKey || 'NO-KEY'}
                </span>
                {isBlocked && (
                  <span className="flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                )}
              </div>
              <span className="font-bold text-white text-left line-clamp-2 mb-2 text-sm leading-tight">
                {n.label}
              </span>
              <div className="flex items-center justify-between w-full mt-auto">
                <span
                  className={`px-1.5 py-0.5 rounded-[4px] font-bold text-[9px] uppercase tracking-wider ${
                    n.status === 'DONE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : n.status === 'IN_PROGRESS'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : n.status === 'BLOCKED'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                  }`}
                >
                  {n.status || 'TODO'}
                </span>
                {n.estimatedHours && (
                  <span className="text-zinc-500 font-mono text-[10px] font-bold">
                    {n.estimatedHours}h
                  </span>
                )}
              </div>
            </div>
          ),
        },
        style: {
          background: isCritical ? '#181212' : '#131720',
          color: '#e4e4e7',
          border: isCritical ? '2px solid #ef4444' : '1px solid #27272a',
          borderRadius: '12px',
          width: 220,
          height: 90,
          boxShadow: isCritical
            ? '0 0 20px rgba(239, 68, 68, 0.25)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
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
          stroke: isCritical ? '#ef4444' : '#3f3f46',
          strokeWidth: isCritical ? 3 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCritical ? '#ef4444' : '#3f3f46',
        },
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [graphData, criticalPath, layoutPositions, setNodes, setEdges]);



  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeData(node.data);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-6 relative">
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">Delivery Network</h2>
          <p className="text-zinc-400 font-medium tracking-wide mt-1 uppercase text-xs">Analyze critical path and blockages.</p>
        </div>
        <div className="flex gap-4 items-center">
          <Button 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide"
            onClick={() => window.location.reload()}
          >
            ↻ Refresh Layout
          </Button>
        </div>
      </div>

      {/* Info Stats Bar */}
      {criticalPath && (
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-zinc-500" />
            <span className="text-zinc-400 font-semibold uppercase tracking-wider text-xs">Critical Sequence:</span>
            <span className="text-white font-bold text-lg">{criticalPath.criticalPathTaskIds.length} Tasks</span>
          </div>
          <div className="h-4 w-px bg-zinc-800"></div>
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-500" />
            <span className="text-zinc-400 font-semibold uppercase tracking-wider text-xs">Project Duration:</span>
            <span className="text-white font-bold text-lg">{criticalPath.projectDuration} Hours</span>
          </div>
          <div className="h-4 w-px bg-zinc-800"></div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
            <span className="text-zinc-400 font-semibold uppercase tracking-wider text-xs">Bottleneck Tasks:</span>
            <span className="text-red-400 font-black tracking-widest text-lg">
              {criticalPath.tasks.filter((t) => t.isCritical).map((t) => t.taskKey).join(', ') || 'NONE'}
            </span>
          </div>
        </div>
      )}

      {/* Graph Visual Canvas & Side Panel Container */}
      <div className="flex-1 w-full flex relative overflow-hidden bg-[#0a0a0a] border border-zinc-800/80 rounded-xl shadow-2xl">
        
        {/* Main Graph Area */}
        <div className={`flex-1 relative transition-all duration-300 ${selectedNodeData ? 'mr-96' : ''}`}>
          {loadingGraph || loadingPath ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : graphError ? (
            <div className="p-8">
              <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Connection Error</h3>
                  <p className="text-red-200">Failed to connect to the Neo4j intelligence layer.</p>
                </div>
              </div>
            </div>
          ) : !nodes || nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 font-bold tracking-widest uppercase">
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
              <Background color="#27272a" gap={20} size={1} />
              <Controls className="bg-[#131720] border border-zinc-800 rounded-lg text-white shadow-xl" />
            </ReactFlow>
          )}
        </div>

        {/* Side Detail Panel */}
        <div 
          className={`absolute top-0 right-0 h-full w-96 bg-[#131720] border-l border-zinc-800/80 shadow-2xl transform transition-transform duration-300 z-10 flex flex-col ${
            selectedNodeData ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedNodeData && (
            <>
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <h3 className="font-mono text-sm font-bold text-zinc-400 uppercase tracking-widest">{selectedNodeData.taskKey}</h3>
                  {selectedNodeData.isCritical && (
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest rounded-sm">
                      Critical Path
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedNodeData(null)} className="h-8 w-8 text-zinc-400 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight mb-4">{selectedNodeData.label}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-sm font-bold text-xs uppercase tracking-wider ${
                      selectedNodeData.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400' : 
                      selectedNodeData.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400' :
                      selectedNodeData.status === 'BLOCKED' ? 'bg-red-500/10 text-red-500' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {selectedNodeData.status || 'TODO'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0B0E14] border border-zinc-800/50 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mb-1"><Clock className="w-3 h-3" /> Est. Hours</span>
                    <span className="text-xl font-black text-white">{selectedNodeData.estimatedHours || 0}</span>
                  </div>
                  <div className="bg-[#0B0E14] border border-zinc-800/50 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mb-1"><BarChart4 className="w-3 h-3" /> Story Points</span>
                    <span className="text-xl font-black text-white">{selectedNodeData.storyPoints || 0}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Health Impact</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-300 font-medium">Schedule Risk</span>
                      <span className={selectedNodeData.status === 'BLOCKED' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {selectedNodeData.status === 'BLOCKED' ? 'High' : 'Low'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-300 font-medium">Downstream Impact</span>
                      <span className="text-amber-400 font-bold">
                        Medium
                      </span>
                    </div>
                  </div>
                </div>

                {selectedNodeData.isCritical && selectedNodeData.status === 'BLOCKED' && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mt-8">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Active Blocker</span>
                    </div>
                    <p className="text-sm text-red-200/80 leading-relaxed">
                      This task is actively blocking the critical path. Every hour this remains blocked translates to a 1:1 delay in the final project delivery date.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
