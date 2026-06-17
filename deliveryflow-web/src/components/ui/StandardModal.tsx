import React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface StandardModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function StandardModal({ 
  open, 
  onClose, 
  title, 
  children,
  primaryAction,
  secondaryAction
}: StandardModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/15 backdrop-blur-[1px] flex items-center justify-center p-4">
        <div 
          className="bg-white border border-zinc-200 rounded-2xl shadow-xl w-full max-w-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {children}
          </div>

          {/* Footer */}
          {(primaryAction || secondaryAction) && (
            <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
              {secondaryAction ? (
                <Button variant="outline" className="bg-white border-zinc-200 text-zinc-700 font-semibold" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              ) : <div />}

              {primaryAction && (
                <Button 
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-sm"
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled || primaryAction.loading}
                >
                  {primaryAction.loading ? 'Loading...' : primaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
