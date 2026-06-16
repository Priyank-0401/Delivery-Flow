import { useMemo } from 'react';
import ReactFlow, { Background, Controls, type Node, type Edge, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

// Custom Node Component
const CustomNode = ({ data }: { data: { id: string; label: string; status: 'success' | 'warning' | 'critical' | 'external' } }) => {
  const getBorderColor = () => {
    switch (data.status) {
      case 'success': return 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      case 'warning': return 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      case 'critical': return 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'external': return 'border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.2)]';
    }
  };

  const getBadgeColor = () => {
    switch (data.status) {
      case 'success': return 'bg-emerald-500/10 text-emerald-400';
      case 'warning': return 'bg-amber-500/10 text-amber-400';
      case 'critical': return 'bg-red-500/10 text-red-400';
      case 'external': return 'bg-purple-500/10 text-purple-400';
    }
  };

  return (
    <div className={`px-4 py-3 rounded-lg bg-zinc-950 border-t-2 border-l border-r border-b border-zinc-800 ${getBorderColor()} min-w-[180px]`}>
      <div className="flex flex-col gap-1">
        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-max ${getBadgeColor()}`}>
          {data.id}
        </div>
        <div className="text-xs font-semibold text-zinc-200 mt-1">{data.label}</div>
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export function DependencyMapPreview() {
  const initialNodes: Node[] = [
    { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { id: 'AUTH-1', label: 'Authentication Service', status: 'success' } },
    { id: '2', type: 'custom', position: { x: 500, y: 50 }, data: { id: 'API-2', label: 'User Management API', status: 'success' } },
    { id: '3', type: 'custom', position: { x: 150, y: 150 }, data: { id: 'DB-1', label: 'Database Schema', status: 'success' } },
    { id: '4', type: 'custom', position: { x: 380, y: 150 }, data: { id: 'PAY-1', label: 'Payment Service', status: 'warning' } },
    { id: '5', type: 'custom', position: { x: 620, y: 150 }, data: { id: 'NOTIF-1', label: 'Notification Service', status: 'success' } },
    { id: '6', type: 'custom', position: { x: 150, y: 250 }, data: { id: 'WEB-1', label: 'Web App Frontend', status: 'success' } },
    { id: '7', type: 'custom', position: { x: 380, y: 250 }, data: { id: 'MOB-1', label: 'Mobile App', status: 'critical' } },
    { id: '8', type: 'custom', position: { x: 620, y: 250 }, data: { id: 'ANALYTICS-1', label: 'Analytics Dashboard', status: 'success' } },
    { id: '9', type: 'custom', position: { x: 380, y: 350 }, data: { id: 'REL-1', label: 'v1.0.0 Release', status: 'external' } },
  ];

  const defaultEdgeOptions = {
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#52525b', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#52525b',
    },
  };

  const initialEdges: Edge[] = [
    { id: 'e1-3', source: '1', target: '3' },
    { id: 'e1-4', source: '1', target: '4' },
    { id: 'e2-4', source: '2', target: '4' },
    { id: 'e2-5', source: '2', target: '5' },
    { id: 'e3-6', source: '3', target: '6' },
    { id: 'e4-7', source: '4', target: '7', style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e4-6', source: '4', target: '6' },
    { id: 'e5-8', source: '5', target: '8' },
    { id: 'e6-9', source: '6', target: '9', animated: false, style: { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    { id: 'e7-9', source: '7', target: '9', animated: false, style: { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    { id: 'e8-9', source: '8', target: '9', animated: false, style: { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
  ];

  const nodes = useMemo(() => initialNodes, []);
  const edges = useMemo(() => initialEdges, []);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '350px' }}>
      <div className="absolute top-0 left-0 flex items-center gap-4 z-10 text-xs font-medium bg-[#0B0E14]/80 px-3 py-1.5 rounded-full border border-zinc-800">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> On Track</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> At Risk</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Blocked</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div> External</div>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        className="bg-transparent"
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#27272a" gap={16} size={1} />
        <Controls showInteractive={false} className="bg-zinc-900 border-zinc-800 fill-zinc-400" />
      </ReactFlow>
    </div>
  );
}
