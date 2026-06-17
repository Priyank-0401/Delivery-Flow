import React, { useState } from 'react';
import { ArrowUpDown, ArrowDown, ArrowUp, Columns, Search, Settings2, Check } from 'lucide-react';
import { Button } from './button';

export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  activeRowId?: string | number | null;
  enableBulkSelect?: boolean;
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
}

type DensityMode = 'comfortable' | 'compact' | 'ultra';

export function DataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  onRowClick, 
  isLoading, 
  activeRowId,
  enableBulkSelect,
  onSelectionChange
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [density, setDensity] = useState<DensityMode>('compact');
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleSelection = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelected));
    }
  };

  const toggleAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
      if (onSelectionChange) onSelectionChange([]);
    } else {
      const allIds = data.map(d => d.id);
      setSelectedIds(new Set(allIds));
      if (onSelectionChange) onSelectionChange(allIds);
    }
  };

  const cycleDensity = () => {
    if (density === 'comfortable') setDensity('compact');
    else if (density === 'compact') setDensity('ultra');
    else setDensity('comfortable');
  };

  const getRowHeightClass = () => {
    if (density === 'comfortable') return 'h-[56px]';
    if (density === 'ultra') return 'h-[36px]';
    return 'h-[44px]'; // compact
  };

  const sortedData = [...data].sort((a: any, b: any) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative h-full">
      
      {/* Bulk Action Header Override */}
      {selectedIds.size > 0 && enableBulkSelect && (
        <div className="absolute top-0 left-0 right-0 h-[65px] bg-indigo-600 z-20 flex items-center justify-between px-6 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4 text-white">
            <span className="font-bold">{selectedIds.size} selected</span>
            <div className="w-px h-4 bg-indigo-500"></div>
            <button className="text-sm font-semibold hover:text-indigo-200 transition-colors">Assign</button>
            <button className="text-sm font-semibold hover:text-indigo-200 transition-colors">Move Sprint</button>
            <button className="text-sm font-semibold hover:text-indigo-200 transition-colors">Change Status</button>
            <button className="text-sm font-semibold text-red-300 hover:text-red-200 transition-colors">Delete</button>
          </div>
          <Button variant="ghost" className="text-indigo-200 hover:text-white hover:bg-indigo-500" onClick={() => setSelectedIds(new Set())}>
            Cancel
          </Button>
        </div>
      )}

      {/* Table Controls (Search & Density) */}
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80 shrink-0">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-white border-zinc-200 text-zinc-600 font-bold shadow-sm hover:bg-zinc-50">
            <Columns className="w-4 h-4 mr-2" /> Columns
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white border-zinc-200 text-zinc-600 font-bold shadow-sm hover:bg-zinc-50"
            onClick={cycleDensity}
          >
            <Settings2 className="w-4 h-4 mr-2" /> {density.charAt(0).toUpperCase() + density.slice(1)}
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto bg-white min-h-0">
        <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
          <thead className="bg-zinc-50 sticky top-0 z-10 shadow-[0_1px_0_0_#e4e4e7]">
            <tr>
              {enableBulkSelect && (
                <th className="px-6 py-3 w-12 text-center border-b border-zinc-200 bg-zinc-50">
                  <button 
                    onClick={toggleAll}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedIds.size === data.length && data.length > 0 ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-zinc-300'}`}
                  >
                    {selectedIds.size === data.length && data.length > 0 && <Check className="w-3 h-3 text-white" />}
                  </button>
                </th>
              )}
              {columns.map(col => (
                <th 
                  key={col.key} 
                  className={`px-6 py-3 font-bold text-zinc-600 border-b border-zinc-200 bg-zinc-50 ${col.width || 'w-auto'} ${col.sortable ? 'cursor-pointer hover:bg-zinc-100 transition-colors' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && (
                      <span className="text-zinc-400">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {enableBulkSelect && <td className="px-6 py-4"><div className="w-4 h-4 bg-zinc-100 rounded"></div></td>}
                  {columns.map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-zinc-100 rounded w-24"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (enableBulkSelect ? 1 : 0)} className="px-6 py-12 text-center text-zinc-500 font-medium bg-zinc-50/50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="w-6 h-6 text-zinc-300" />
                    <span>No records found matching criteria.</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row) => {
                const isActive = activeRowId === row.id;
                const isSelected = selectedIds.has(row.id);
                return (
                  <tr 
                    key={row.id} 
                    onClick={() => onRowClick?.(row)}
                    className={`group transition-colors border-b border-zinc-100 last:border-0 ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${
                      isActive 
                        ? 'bg-indigo-50/60' 
                        : isSelected 
                          ? 'bg-indigo-50/30' 
                          : 'hover:bg-zinc-50'
                    }`}
                  >
                    {enableBulkSelect && (
                      <td className={`px-6 py-1 w-12 text-center ${getRowHeightClass()}`}>
                        <button 
                          onClick={(e) => toggleSelection(row.id, e)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-zinc-300 group-hover:border-zinc-400'}`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={col.key} className={`px-6 py-1 ${getRowHeightClass()}`}>
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer / Pagination */}
      <div className="p-4 border-t border-zinc-200 bg-zinc-50 shrink-0 flex items-center justify-between text-sm text-zinc-500 font-medium">
        <span>Showing <strong className="text-zinc-900">{sortedData.length}</strong> records</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-white font-bold border-zinc-200 h-8 shadow-sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" className="bg-white font-bold border-zinc-200 h-8 shadow-sm" disabled>Next</Button>
        </div>
      </div>
    </div>
  );
}
