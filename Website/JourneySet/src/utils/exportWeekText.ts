import { format } from 'date-fns';
import { PlannerTask } from '../types';
import { weekKeyToMonday } from './weekKey';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const byTime = (a: PlannerTask, b: PlannerTask) => {
  if (a.time && b.time) return a.time.localeCompare(b.time);
  if (a.time) return -1;
  if (b.time) return 1;
  return 0;
};

/** Downloads one week of tasks as a plain-text file (Export → Download as text). */
export const downloadWeekAsText = (tasks: PlannerTask[], weekKey: string) => {
  const weekTasks = tasks.filter(task => task.weekKey === weekKey);
  const content = DAYS.map(day => {
    const lines = weekTasks
      .filter(task => task.dayKey === day)
      .sort(byTime)
      .map(
        task =>
          `  ${task.completed ? '✓' : '○'} ${task.title}${task.time ? ` (${task.time})` : ''}${task.recurring === 'weekly' ? ' [weekly]' : ''}`
      )
      .join('\n');
    return `${day}:\n${lines || '  No tasks'}`;
  }).join('\n\n');

  const heading = `Weekly plan, week of ${format(weekKeyToMonday(weekKey), 'MMMM d, yyyy')} (${weekKey})`;
  const blob = new Blob([`${heading}\n\n${content}\n`], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `weekly-plan-${weekKey}.txt`;
  a.click();
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
