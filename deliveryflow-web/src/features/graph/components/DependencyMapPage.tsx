import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { projectService } from '@/api/projects';
import { graphService } from '../api/graph';
import { AlertCircle, Play, Info } from 'lucide-react';

export function DependencyMapPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // 1. Fetch Projects
  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  // Set initial selected project
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

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
        const spacing = 140;
        const totalHeight = (groupNodes.length - 1) * spacing;
        const y = 250 + (index * spacing - totalHeight / 2);
        const x = lvl * 280 + 100;
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

      return {
        id: n.id,
        position: pos,
        data: {
          label: (
            <div className="flex flex-col items-start text-xs p-1">
              <span className="font-mono text-[10px] text-zinc-400 font-semibold mb-1">
                {n.taskKey || 'NO-KEY'}
              </span>
              <span className="font-bold text-white text-left line-clamp-1 mb-1.5">
                {n.label}
              </span>
              <div className="flex items-center justify-between w-full">
                <span
                  className={`px-1.5 py-0.5 rounded-[4px] font-bold text-[9px] uppercase tracking-wide ${
                    n.status === 'DONE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : n.status === 'IN_PROGRESS'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                  }`}
                >
                  {n.status || 'TODO'}
                </span>
                {n.estimatedHours && (
                  <span className="text-zinc-500 text-[10px] font-medium">
                    {n.estimatedHours}h
                  </span>
                )}
              </div>
            </div>
          ),
        },
        style: {
          background: isCritical ? '#181212' : '#0B0F19',
          color: '#e4e4e7',
          border: isCritical ? '2px solid #ef4444' : '1px solid #1e293b',
          borderRadius: '12px',
          width: 200,
          boxShadow: isCritical
            ? '0 0 15px rgba(239, 68, 68, 0.15)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
      };
    });

    const flowEdges = graphData.edges.map((e) => {
      const isCritical =
        criticalNodeIds.has(e.source) && criticalNodeIds.has(e.target);

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        animated: isCritical,
        style: {
          stroke: isCritical ? '#ef4444' : '#334155',
          strokeWidth: isCritical ? 2.5 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCritical ? '#ef4444' : '#334155',
        },
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [graphData, criticalPath, layoutPositions, setNodes, setEdges]);

  const selectedProjectCode = useMemo(() => {
    return projects?.find((p) => p.id === selectedProjectId)?.projectCode || '';
  }, [projects, selectedProjectId]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Dependency Map
          </h2>
          <p className="text-sm text-zinc-400">
            Visualize project schedules and bottleneck paths.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-3 bg-zinc-950 px-3 py-2 border border-zinc-800 rounded-lg shadow-inner">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Project:
          </label>
          {loadingProjects ? (
            <span className="text-xs text-zinc-500">Loading...</span>
          ) : (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer pr-4"
            >
              {projects?.map((proj) => (
                <option
                  key={proj.id}
                  value={proj.id}
                  className="bg-zinc-950 text-white font-medium"
                >
                  {proj.name} ({proj.projectCode})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Info Stats Bar */}
      {criticalPath && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0d111a] border border-zinc-800/80 rounded-xl p-3 text-sm">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-400">Critical Sequence:</span>
            <span className="text-white font-semibold">
              {criticalPath.criticalPathTaskIds.length} Tasks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-400">Project Duration:</span>
            <span className="text-white font-semibold">
              {criticalPath.projectDuration} Hours
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-zinc-400">Bottleneck Tasks:</span>
            <span className="text-red-400 font-bold">
              {criticalPath.tasks
                .filter((t) => t.isCritical)
                .map((t) => t.taskKey)
                .join(', ') || 'None'}
            </span>
          </div>
        </div>
      )}

      {/* Graph Visual Canvas */}
      <div className="flex-1 w-full bg-zinc-950 border border-zinc-800/60 rounded-xl overflow-hidden relative shadow-inner">
        {loadingGraph || loadingPath ? (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
            Mapping dependency network...
          </div>
        ) : graphError ? (
          <div className="p-6">
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white mb-0.5">Connection Error</h3>
                <p className="text-sm">
                  Failed to connect to the backend Neo4j replication mapping. Make sure
                  the backend application is running.
                </p>
              </div>
            </div>
          </div>
        ) : !nodes || nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
            No tasks or relationships exist for project ({selectedProjectCode}). Use Sprints or Tasks tabs to seed data.
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            minZoom={0.2}
            maxZoom={1.5}
          >
            <Background color="#3f3f46" gap={16} size={1} />
            <Controls className="bg-zinc-900 border border-zinc-800 rounded-lg text-white" />
            <MiniMap
              nodeColor={(n) => {
                const isCritical = criticalPath?.criticalPathTaskIds?.includes(n.id);
                return isCritical ? '#ef4444' : '#1e293b';
              }}
              maskColor="rgba(0,0,0,0.6)"
              style={{ background: '#09090b', border: '1px solid #27272a' }}
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
