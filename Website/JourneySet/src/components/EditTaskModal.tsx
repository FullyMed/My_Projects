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
    recurring: task.recurring
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
      recurring: formData.recurring as 'none' | 'weekly'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="presentation">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-task-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white" id="edit-task-title">Edit Task</h3>
          <button
            onClick={onClose}
            aria-label="Close edit task modal"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              id="task-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              aria-label="Task title"
            />
          </div>

          <div>
            <label htmlFor="task-day" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Day
            </label>
            <select
              id="task-day"
              value={formData.dayKey}
              onChange={(e) => handleChange('dayKey', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Task day"
            >
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time (optional)
            </label>
            <input
              id="task-time"
              type="time"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Task time"
            />
          </div>

          <div>
            <label htmlFor="task-recurring" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recurring
            </label>
            <select
              id="task-recurring"
              value={formData.recurring}
              onChange={(e) => handleChange('recurring', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Task recurring"
            >
              <option value="none">None</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="completed"
              checked={formData.completed}
              onChange={(e) => handleChange('completed', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-label="Mark task as completed"
            />
            <label htmlFor="completed" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Completed
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Cancel editing"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label="Save task changes"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
