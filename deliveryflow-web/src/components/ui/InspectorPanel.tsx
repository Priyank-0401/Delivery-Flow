import React from 'react';
import { DetailDrawer } from './DetailDrawer';
import { Sparkles, Activity, AlertTriangle, Lightbulb } from 'lucide-react';
import { Button } from './button';

interface InspectorPanelProps {
  open: boolean;
  onClose: () => void;
  header: {
    badge?: string;
    title: string;
    status: React.ReactNode;
  };
  metadata: { label: string; value: React.ReactNode; icon?: React.ReactNode }[];
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
  aiInsights?: {
    problem: string;
    impact: string;
    recommendation: string;
    confidence: number;
  };
  footerActions: {
    primary: { label: string; onClick: () => void; icon?: React.ReactNode };
    secondary?: { label: string; onClick: () => void; icon?: React.ReactNode; variant?: 'outline' | 'destructive' };
  };
}

export function InspectorPanel({
  open,
  onClose,
  header,
  metadata,
  tabs,
  activeTab,
  onTabChange,
  children,
  aiInsights,
  footerActions
}: InspectorPanelProps) {
  return (
    <DetailDrawer open={open} onClose={onClose} title={header.title}>
      <div className="flex flex-col h-full -mx-6 -my-6">
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="space-y-8 px-6 pt-6">
            
            {/* Header Section */}
            <div className="space-y-4">
              {header.badge && (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-500 font-bold text-xs px-2 py-1 bg-zinc-100 rounded border border-zinc-200">
                    {header.badge}
                  </span>
                </div>
              )}
              <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-none">{header.title}</h2>
              <div className="flex items-center gap-4">
                {header.status}
              </div>
            </div>

            {/* Metadata Grid */}
            {metadata.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {metadata.map((item, idx) => (
                  <div key={idx} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.label}</span>
                    <p className="text-xl font-black text-zinc-900 flex items-center gap-2">
                      {item.icon && <span className="text-zinc-400 shrink-0">{item.icon}</span>}
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tabs */}
            {tabs.length > 0 && (
              <div className="border-b border-zinc-200 flex items-center gap-6">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={`pb-3 text-sm font-bold ${activeTab === tab ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500 hover:text-zinc-700 font-semibold'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {/* AI Insights Block */}
            {aiInsights && activeTab === tabs[0] && (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-indigo-900">AI Analysis</h3>
                  <span className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                    {aiInsights.confidence}% Confidence
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-0.5">Problem</span>
                      <p className="text-sm font-medium text-zinc-800">{aiInsights.problem}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Activity className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-red-700 uppercase tracking-widest block mb-0.5">Impact</span>
                      <p className="text-sm font-medium text-zinc-800">{aiInsights.impact}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-0.5">Recommendation</span>
                      <p className="text-sm font-medium text-zinc-800">{aiInsights.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Content */}
            <div className="pt-2">
              {children}
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 w-full bg-white border-t border-zinc-200 p-6 flex flex-col gap-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
           <Button 
             className="w-full font-bold bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-2 py-6 text-base"
             onClick={footerActions.primary.onClick}
           >
             {footerActions.primary.icon} {footerActions.primary.label}
           </Button>
           {footerActions.secondary && (
             <Button 
               variant={footerActions.secondary.variant || 'outline'} 
               className={`w-full font-bold shadow-sm border-zinc-200 flex items-center gap-2 py-5 ${
                 footerActions.secondary.variant === 'destructive' ? 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200' : 'text-zinc-900 bg-white hover:bg-zinc-50'
               }`}
               onClick={footerActions.secondary.onClick}
             >
               {footerActions.secondary.icon} {footerActions.secondary.label}
             </Button>
           )}
        </div>
      </div>
    </DetailDrawer>
  );
}
