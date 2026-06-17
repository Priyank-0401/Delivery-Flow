import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Plus, Search, Activity, Users, Timer } from 'lucide-react';

export interface EntityOption {
  id: string;
  label: string;
  group?: 'Recent' | 'Pinned' | 'All';
  icon?: React.ReactNode;
  health?: number;
  sprint?: string;
  owner?: string;
}

interface EntitySelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  options: EntityOption[];
  placeholder?: string;
  onCreateNew?: () => void;
  triggerIcon?: React.ReactNode;
}

export function EntitySelector({ value, onChange, options, placeholder = "Select...", onCreateNew, triggerIcon }: EntitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.id === value);
  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));

  // Group options if groups exist
  const hasGroups = options.some(o => o.group);
  const groupedOptions = hasGroups 
    ? filteredOptions.reduce((acc, opt) => {
        const group = opt.group || 'All';
        if (!acc[group]) acc[group] = [];
        acc[group].push(opt);
        return acc;
      }, {} as Record<string, EntityOption[]>)
    : { 'All': filteredOptions };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {triggerIcon && <span className="text-zinc-500">{triggerIcon}</span>}
        <span className="text-sm font-bold text-zinc-900">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-zinc-400" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-100">
          {/* Search */}
          <div className="flex items-center px-3 border-b border-zinc-100 bg-zinc-50/50">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-3 bg-transparent outline-none text-sm font-medium text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal"
            />
          </div>

          {/* Options List */}
          <div className="max-h-[360px] overflow-y-auto p-1.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-sm font-medium text-zinc-500">No results found.</div>
            ) : (
              Object.entries(groupedOptions).map(([group, opts]) => (
                <div key={group} className="mb-2 last:mb-0">
                  {hasGroups && opts.length > 0 && (
                    <div className="px-2 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {group}
                    </div>
                  )}
                  {opts.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { onChange(opt.id); setIsOpen(false); setQuery(''); }}
                      className="w-full flex flex-col p-2 rounded-lg hover:bg-zinc-100 text-left transition-colors relative group"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <div className="flex items-center gap-2">
                          {opt.icon && <span className="text-zinc-500">{opt.icon}</span>}
                          <span className={`text-sm ${value === opt.id ? 'font-bold text-zinc-900' : 'font-bold text-zinc-700'}`}>
                            {opt.label}
                          </span>
                        </div>
                        {value === opt.id && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                      
                      {/* Rich Data Area */}
                      {(opt.owner || opt.health !== undefined || opt.sprint) && (
                        <div className="flex items-center gap-3 mt-1 px-1">
                          {opt.health !== undefined && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                              <Activity className="w-3 h-3" /> {opt.health}
                            </span>
                          )}
                          {opt.sprint && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                              <Timer className="w-3 h-3" /> {opt.sprint}
                            </span>
                          )}
                          {opt.owner && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                              <Users className="w-3 h-3" /> {opt.owner}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Footer Action */}
          {onCreateNew && (
            <div className="p-2 border-t border-zinc-100 bg-zinc-50">
              <button 
                onClick={() => { onCreateNew(); setIsOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-lg hover:bg-zinc-100 text-left transition-colors text-zinc-600 hover:text-zinc-900 font-bold text-sm border border-zinc-200 shadow-sm bg-white"
              >
                <Plus className="w-4 h-4" />
                Create New Project
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
