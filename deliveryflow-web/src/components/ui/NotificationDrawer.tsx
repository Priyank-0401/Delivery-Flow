import React from 'react';
import { X, Bell, ShieldAlert, AlertCircle, Timer, Users, Sparkles, Check } from 'lucide-react';
import { Button } from './button';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  if (!open) return null;

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'BLOCKED',
      title: 'Task Blocked: Payment Gateway',
      time: '10m ago',
      icon: ShieldAlert,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      id: 2,
      type: 'RISK',
      title: 'Risk Created: Vendor API downtime',
      time: '1h ago',
      icon: AlertCircle,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      id: 3,
      type: 'SPRINT',
      title: 'Sprint 4 ending in 3 days',
      time: '2h ago',
      icon: Timer,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      id: 4,
      type: 'TEAM',
      title: 'Backend Team exceeded 115% capacity',
      time: '5h ago',
      icon: Users,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      id: 5,
      type: 'AI',
      title: 'AI Recommendation: Reallocate frontend dev',
      time: '1d ago',
      icon: Sparkles,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
    }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200 border-l border-zinc-200">
        
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Notifications</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {notifications.map(n => (
                <div key={n.id} className="p-4 hover:bg-zinc-50 transition-colors cursor-pointer group">
                  <div className="flex gap-4">
                    <div className={`p-2 rounded-lg shrink-0 h-fit ${n.bg}`}>
                      <n.icon className={`w-4 h-4 ${n.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {n.title}
                      </p>
                      <p className="text-xs font-semibold text-zinc-500">
                        {n.time}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Standardized Empty State
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border border-zinc-200">
                <Check className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">All Caught Up</h3>
              <p className="text-sm font-medium text-zinc-500 mb-6 max-w-[250px]">
                You have no pending notifications. Action items and critical alerts will appear here.
              </p>
              <Button variant="outline" className="font-semibold bg-white shadow-sm border-zinc-200 text-zinc-900">
                Notification Settings
              </Button>
              <a href="#" className="text-xs font-semibold text-indigo-600 mt-4 hover:underline">
                View notification documentation
              </a>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-4 border-t border-zinc-200 bg-zinc-50">
            <Button className="w-full font-bold bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-sm">
              Mark all as read
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
