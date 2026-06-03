import React, { useState, useEffect, useRef } from 'react';
import { Download, ChevronDown } from 'lucide-react';

interface ExportButtonProps {
  onPrint: (format: 'print') => void;
  label?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onPrint, label = 'Export' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-lg transition-all duration-150 cursor-pointer"
      >
        <Download className="h-4 w-4" />
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-card-hover border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
          <button
            onClick={() => {
              onPrint('print');
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Print-ready view
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
