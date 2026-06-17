import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}

export function DetailDrawer({ open, onClose, title, children, width = 'w-[560px]' }: DetailDrawerProps) {
  
  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop (invisible but captures outside clicks) */}
      <div 
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-screen ${width} bg-white border-l border-zinc-200 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <div className="font-semibold text-zinc-900 truncate">
            {title}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}
