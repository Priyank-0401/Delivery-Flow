import React, { useEffect, useState } from 'react';
import { Search, Briefcase, CheckSquare, Users, Timer, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // The parent layout will actually toggle open state, but this helps catch if mounted
      }
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const mockResults = [
    { id: '1', title: 'Project Phoenix', type: 'Project', icon: Briefcase, path: '/projects' },
    { id: '2', title: 'Update Payment Gateway', type: 'Task', icon: CheckSquare, path: '/tasks' },
    { id: '3', title: 'Backend Overload', type: 'Risk', icon: ShieldAlert, path: '/health' },
    { id: '4', title: 'Sprint 31', type: 'Sprint', icon: Timer, path: '/sprints' },
    { id: '5', title: 'Frontend Team', type: 'Team', icon: Users, path: '/teams' },
  ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/15 backdrop-blur-[1px] flex items-start justify-center pt-[15vh] p-4">
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xl w-full max-w-[600px] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-zinc-100">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input 
            autoFocus
            type="text" 
            placeholder="Search projects, tasks, teams..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-4 bg-transparent outline-none text-zinc-900 font-medium placeholder:text-zinc-400 placeholder:font-normal"
          />
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-zinc-100 border border-zinc-200 rounded text-[10px] font-bold text-zinc-500">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
          {mockResults.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-sm font-medium">
              No results found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                Suggestions
              </div>
              {mockResults.map(res => (
                <button
                  key={res.id}
                  onClick={() => handleSelect(res.path)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-100 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-zinc-50 border border-zinc-200 rounded-md group-hover:bg-white transition-colors">
                      <res.icon className="w-4 h-4 text-zinc-500" />
                    </div>
                    <span className="font-semibold text-sm text-zinc-900">{res.title}</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">{res.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-zinc-200/50 rounded font-bold">↑</kbd> <kbd className="px-1.5 py-0.5 bg-zinc-200/50 rounded font-bold">↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-zinc-200/50 rounded font-bold">↵</kbd> to select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
