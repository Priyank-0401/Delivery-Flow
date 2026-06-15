import { AlertCircle, CheckCircle2, Clock, GitCommit, PlayCircle } from 'lucide-react';

interface PathNode {
  id: string;
  name: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'AT_RISK' | 'TODO';
  delay?: string;
}

const CRITICAL_PATH: PathNode[] = [
  { id: 'AUTH-1', name: 'Auth Service', status: 'COMPLETED' },
  { id: 'API-2', name: 'User API', status: 'IN_PROGRESS' },
  { id: 'PAY-1', name: 'Payment Gateway', status: 'AT_RISK', delay: '+2 days' },
  { id: 'MOB-1', name: 'Mobile App Auth', status: 'TODO' },
  { id: 'REL-1', name: 'v1.0.0 Release', status: 'TODO' },
];

export function CriticalPathList() {
  const getStatusIcon = (status: PathNode['status']) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'IN_PROGRESS': return <PlayCircle className="h-5 w-5 text-sky-500" />;
      case 'AT_RISK': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'TODO': return <Clock className="h-5 w-5 text-zinc-600" />;
    }
  };

  const getStatusColor = (status: PathNode['status']) => {
    switch (status) {
      case 'COMPLETED': return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
      case 'IN_PROGRESS': return 'border-sky-500/30 bg-sky-500/5 text-sky-400';
      case 'AT_RISK': return 'border-red-500/30 bg-red-500/5 text-red-400';
      case 'TODO': return 'border-zinc-800 bg-zinc-900/50 text-zinc-500';
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-300">Critical Path</h3>
        <span className="text-xs font-medium bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
          +2 Days Delay
        </span>
      </div>

      <div className="flex-1 relative pl-3 mt-2">
        {/* Vertical Line */}
        <div className="absolute left-[21px] top-4 bottom-8 w-px bg-zinc-800"></div>

        <div className="flex flex-col gap-6 relative">
          {CRITICAL_PATH.map((node) => (
            <div key={node.id} className="flex gap-4">
              <div className="relative z-10 flex-shrink-0 bg-[#131720] rounded-full p-1 border border-zinc-800">
                {getStatusIcon(node.status)}
              </div>
              
              <div className={`flex-1 rounded-lg border px-3 py-2 ${getStatusColor(node.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitCommit className="h-3 w-3 opacity-70" />
                    <span className="text-xs font-bold font-mono">{node.id}</span>
                  </div>
                  {node.delay && (
                    <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                      {node.delay}
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium mt-1 text-zinc-200">
                  {node.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-zinc-800/50">
        <button className="w-full text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
          View Full Path Details →
        </button>
      </div>
    </div>
  );
}
