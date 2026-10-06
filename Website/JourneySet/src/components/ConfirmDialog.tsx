import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Trash2 } from 'lucide-react';
import { useModalFocus } from '../hooks/useModalFocus';

interface ConfirmDialogProps {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  /** Resolves when the action settles; the dialog shows a spinner meanwhile. */
  onConfirm: () => Promise<unknown> | void;
  onCancel: () => void;
}

/**
 * Small destructive-action confirmation. Portalled to <body> so it can sit on
 * top of another modal (e.g. the event modal) without either modal's
 * Escape/Tab handling seeing the other's key events.
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}) => {
  const [busy, setBusy] = useState(false);
  const { modalRef } = useModalFocus(true, () => {
    if (!busy) onCancel();
  });

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/20"
      >
        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
        </div>
        <h3 id="confirm-dialog-title" className="text-base font-bold text-center text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <div id="confirm-dialog-message" className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6 leading-relaxed break-words">
          {message}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            data-autofocus
            className="flex-1 px-4 min-h-[44px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-900 dark:text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 min-h-[44px] bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
