import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useModalFocus } from '../hooks/useModalFocus';

interface DeleteAccountDialogProps {
  onClose: () => void;
}

/**
 * Permanent account deletion. The user must type their email to enable the
 * button, so it can't be triggered by a stray click.
 */
const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ onClose }) => {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const { modalRef } = useModalFocus(true, () => {
    if (!deleting) onClose();
  });

  const email = user?.email ?? '';
  const matches = typed.trim().toLowerCase() === email.toLowerCase() && email !== '';

  const handleDelete = async () => {
    if (!matches || deleting) return;
    setDeleting(true);
    setError('');
    const result = await deleteAccount();
    if (!result.success) {
      setDeleting(false);
      setError(result.error || "Couldn't delete your account. Please try again.");
      return;
    }
    navigate('/', { replace: true });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-desc"
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/20"
      >
        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
        </div>
        <h3 id="delete-account-title" className="text-base font-bold text-center text-slate-900 dark:text-white mb-2">
          Delete your account?
        </h3>
        <p id="delete-account-desc" className="text-sm text-center text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
          This permanently deletes your account and <strong className="text-slate-700 dark:text-slate-300">all</strong> your
          tasks, goals and events. It can't be undone — export anything you want to keep first.
        </p>

        <label htmlFor="delete-confirm-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Type <span className="font-mono break-all">{email}</span> to confirm
        </label>
        <input
          id="delete-confirm-email"
          type="email"
          value={typed}
          onChange={e => setTyped(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleDelete()}
          autoComplete="off"
          data-autofocus
          disabled={deleting}
          className="w-full px-3.5 py-2.5 mb-4 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 transition-colors min-h-[44px]"
        />

        {error && (
          <p role="alert" className="mb-4 text-sm text-rose-600 dark:text-rose-400">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 min-h-[44px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-900 dark:text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!matches || deleting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 min-h-[44px] bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountDialog;
