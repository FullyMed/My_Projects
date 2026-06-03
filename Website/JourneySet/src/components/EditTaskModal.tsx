import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PlannerTask } from '../types';
import { useModalFocus } from '../hooks/useModalFocus';

interface EditTaskModalProps {
  task: PlannerTask;
  days: string[];
  onSave: (updatedTask: Partial<PlannerTask>) => void;
  onClose: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, days, onSave, onClose }) => {
  const { modalRef } = useModalFocus(true, onClose);
  const [formData, setFormData] = useState({
    title: task.title,
    dayKey: task.dayKey,
    time: task.time || '',
    completed: task.completed,
    recurring: task.recurring,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      dayKey: formData.dayKey,
      time: formData.time || undefined,
      completed: formData.completed,
      recurring: formData.recurring as 'none' | 'weekly',
    });
    onClose();
  };

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 transition-colors';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end xs:items-center justify-center xs:p-4 z-50 pb-safe" role="presentation">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 rounded-t-2xl xs:rounded-2xl w-full xs:max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/20 sheet-enter xs:animate-none max-h-[92dvh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-task-title"
      >
        {/* Mobile handle */}
        <div className="flex justify-center pt-3 pb-1 xs:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="hidden xs:block h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-t-2xl" />

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white" id="edit-task-title">
            Edit task
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Title
            </label>
            <input
              id="task-title"
              type="text"
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="task-day" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Day
            </label>
            <select
              id="task-day"
              value={formData.dayKey}
              onChange={e => handleChange('dayKey', e.target.value)}
              className={inputClass}
            >
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-time" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Time <span className="font-normal text-slate-400 normal-case">(optional)</span>
            </label>
            <input
              id="task-time"
              type="time"
              value={formData.time}
              onChange={e => handleChange('time', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="task-recurring" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Repeat
            </label>
            <select
              id="task-recurring"
              value={formData.recurring}
              onChange={e => handleChange('recurring', e.target.value)}
              className={inputClass}
            >
              <option value="none">No repeat</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer py-1">
            <input
              type="checkbox"
              id="completed"
              checked={formData.completed}
              onChange={e => handleChange('completed', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mark as completed</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 cursor-pointer shadow-sm shadow-indigo-500/20"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
