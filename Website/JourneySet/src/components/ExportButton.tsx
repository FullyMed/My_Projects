import React, { useState, useEffect, useRef, useId } from 'react';
import { Download, ChevronDown, Printer, FileText } from 'lucide-react';

interface ExportButtonProps {
  onPrint: () => void;
  /** Planner only: downloads the week as a plain-text file. */
  onDownloadText?: () => void;
  label?: string;
}

/**
 * The page-level Export menu. A real menu button: Escape closes it and puts
 * focus back on the button, arrow keys move between items, and a click
 * outside closes it.
 */
const ExportButton: React.FC<ExportButtonProps> = ({ onPrint, onDownloadText, label = 'Export' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const items = [
    { key: 'print', label: 'Print or save as PDF', icon: Printer, onSelect: onPrint },
    ...(onDownloadText ? [{ key: 'text', label: 'Download as text (.txt)', icon: FileText, onSelect: onDownloadText }] : []),
  ];

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    // Move focus into the menu so arrow keys work straight away.
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const menuItems = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const index = menuItems.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      menuItems[(index + 1) % menuItems.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      menuItems[(index - 1 + menuItems.length) % menuItems.length]?.focus();
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        className="inline-flex items-center gap-2 px-4 min-h-[44px] text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-lg transition-colors duration-150 cursor-pointer"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className="menu-enter absolute right-0 mt-1.5 w-60 p-1 bg-white dark:bg-slate-800 rounded-xl shadow-card-hover border border-slate-200 dark:border-slate-700 z-20"
        >
          {items.map(item => (
            <button
              key={item.key}
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                item.onSelect();
              }}
              className="w-full flex items-center gap-2.5 text-left px-3 min-h-[44px] text-sm text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus-visible:bg-slate-50 dark:focus-visible:bg-slate-700 transition-colors cursor-pointer"
            >
              <item.icon className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportButton;
