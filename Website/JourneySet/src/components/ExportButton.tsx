import React, { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';

interface ExportButtonProps {
  onPrint: (format: 'print') => void;
  label?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onPrint, label = 'Export' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        <span>{label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20">
          <button
            onClick={() => {
              onPrint('print');
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white"
          >
            Print-ready view
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
