import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, addDays, parseISO } from 'date-fns';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import { Printer, X, Loader2 } from 'lucide-react';
import { PlannerTask, Goal, Event } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getCategoryLabel } from '../constants/categories';
import { getPlannerTasks } from '../api/plannerApi';
import { getGoals } from '../api/goalsApi';
import { getEvents } from '../api/eventsApi';

interface PrintViewProps {
  view: 'planner' | 'goals' | 'calendar';
  onClose: () => void;
  /** ISO week key (YYYY-Www) of the week currently shown in WeeklyPlanner */
  weekKey?: string;
}

/** Convert an ISO week key (YYYY-Www) to the Monday of that week */
const weekKeyToMonday = (weekKey: string): Date => {
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);
  // ISO week 1 contains Jan 4th
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = (jan4.getDay() + 6) % 7; // 0 = Mon
  const week1Monday = new Date(jan4.getTime() - dayOfWeek * 86400000);
  return new Date(week1Monday.getTime() + (week - 1) * 7 * 86400000);
};

/** Build the ISO week key for a given date */
const dateToWeekKey = (date: Date): string => {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
};

const PrintView: React.FC<PrintViewProps> = ({ view, onClose, weekKey }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate] = useState(new Date());

  const activeWeekKey = weekKey ?? dateToWeekKey(currentDate);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    (async () => {
      try {
        if (view === 'planner') {
          // Fetch directly from Supabase — not the stale localStorage cache
          const fetched = await getPlannerTasks(user.id, activeWeekKey);
          setTasks(fetched);
        } else if (view === 'goals') {
          const fetched = await getGoals(user.id);
          setGoals(fetched);
        } else {
          // 'calendar'
          const fetched = await getEvents(user.id);
          setEvents(fetched);
        }
      } catch (err) {
        console.error('PrintView: failed to load data', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user, view, activeWeekKey]);

  /* ── Planner ──────────────────────────────────────────── */
  const renderPlannerView = () => {
    const weekStart = weekKeyToMonday(activeWeekKey);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const completedCount = tasks.filter(t => t.completed).length;

    return (
      <div className="print-content">
        <div className="print-header">
          <h1 className="print-title">Weekly Planner</h1>
          <p className="print-subtitle">Week of {format(weekStart, 'MMMM d, yyyy')} · {activeWeekKey}</p>
        </div>

        {tasks.length === 0 ? (
          <p className="no-content">No tasks scheduled for this week.</p>
        ) : (
          <table className="print-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Tasks</th>
              </tr>
            </thead>
            <tbody>
              {days.map(day => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const dayTasks = tasks
                  .filter(t => t.dayKey === dayKey)
                  .sort((a, b) => {
                    if (a.time && b.time) return a.time.localeCompare(b.time);
                    if (a.time) return -1;
                    if (b.time) return 1;
                    return 0;
                  });
                return (
                  <tr key={dayKey}>
                    <td className="day-cell">
                      <strong>{format(day, 'EEE')}</strong>
                      <div>{format(day, 'MMM d')}</div>
                    </td>
                    <td>
                      {dayTasks.length === 0 ? (
                        <span className="no-content">—</span>
                      ) : (
                        <ul className="task-list">
                          {dayTasks.map(task => (
                            <li key={task.id} className={task.completed ? 'completed' : ''}>
                              <span className="task-check">{task.completed ? '✓' : '○'}</span>
                              {task.time && <span className="task-time">{task.time}</span>}
                              <span className="task-title">{task.title}</span>
                              {task.recurring === 'weekly' && (
                                <span className="task-badge">↻ weekly</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <p className="print-summary">
          {completedCount} / {tasks.length} task{tasks.length !== 1 ? 's' : ''} completed
        </p>
      </div>
    );
  };

  /* ── Goals ────────────────────────────────────────────── */
  const renderGoalsView = () => {
    const completedCount = goals.filter(g => g.currentValue >= g.targetValue).length;
    const completionPct = goals.length > 0
      ? Math.round((completedCount / goals.length) * 100)
      : 0;

    return (
      <div className="print-content">
        <div className="print-header">
          <h1 className="print-title">Goal Tracker</h1>
          <p className="print-subtitle">{format(currentDate, 'MMMM d, yyyy')}</p>
        </div>

        {goals.length === 0 ? (
          <p className="no-content">No goals tracked yet.</p>
        ) : (
          <>
            <p className="print-summary" style={{ marginBottom: '20px' }}>
              {completedCount} of {goals.length} goal{goals.length !== 1 ? 's' : ''} completed ({completionPct}%)
            </p>
            <div className="goals-list">
              {goals.map(goal => {
                const progress = goal.targetValue > 0
                  ? (goal.currentValue / goal.targetValue) * 100
                  : 0;
                const isComplete = goal.currentValue >= goal.targetValue;
                const status = isComplete
                  ? 'Completed'
                  : goal.currentValue === 0
                  ? 'Not Started'
                  : 'In Progress';

                return (
                  <div key={goal.id} className="goal-item">
                    <div className="goal-header">
                      <h3>{goal.title}</h3>
                      <span className={`goal-status ${isComplete ? 'status-complete' : ''}`}>
                        {status}
                      </span>
                    </div>
                    {goal.description && (
                      <p className="goal-description">{goal.description}</p>
                    )}
                    <div className="progress-section">
                      <div className="progress-info">
                        <span>
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                        <span className="progress-percent">
                          {Math.round(Math.min(progress, 100))}%
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  /* ── Calendar ─────────────────────────────────────────── */
  const renderCalendarView = () => {
    // Use string comparison to avoid timezone pitfalls with new Date(isoString)
    const startStr = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const endStr = format(endOfMonth(currentDate), 'yyyy-MM-dd');

    const monthEvents = events
      .filter(e => e.dateISO >= startStr && e.dateISO <= endStr)
      .sort((a, b) => {
        if (a.dateISO !== b.dateISO) return a.dateISO.localeCompare(b.dateISO);
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });

    return (
      <div className="print-content">
        <div className="print-header">
          <h1 className="print-title">Event Calendar</h1>
          <p className="print-subtitle">{format(currentDate, 'MMMM yyyy')}</p>
        </div>

        {monthEvents.length === 0 ? (
          <p className="no-content">No events this month.</p>
        ) : (
          <div className="events-list">
            {monthEvents.map(event => (
              <div key={event.id} className="event-item">
                <div className="event-date">
                  <strong>{format(parseISO(event.dateISO), 'EEE, MMM d')}</strong>
                  {event.time && <span className="event-time">{event.time}</span>}
                </div>
                <div className="event-details">
                  <h4>{event.title}</h4>
                  <span className="event-category">{getCategoryLabel(event.category)}</span>
                  {event.description && <p>{event.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {monthEvents.length > 0 && (
          <p className="print-summary">
            {monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''} this month
          </p>
        )}
      </div>
    );
  };

  const titles: Record<typeof view, string> = {
    planner: 'Weekly Planner',
    goals: 'Goal Tracker',
    calendar: 'Event Calendar',
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 overflow-y-auto print:static print:overflow-visible">
      {/* ── Toolbar (hidden on print) ── */}
      <div className="print:hidden sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 xs:px-6 py-3 flex items-center justify-between gap-4 z-10 pt-safe">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm xs:text-base font-bold text-slate-900 dark:text-white truncate">
            {titles[view]} — Print Preview
          </h1>
          {isLoading && <Loader2 className="h-4 w-4 text-indigo-500 animate-spin flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => window.print()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 min-h-[44px] text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-lg transition-all duration-200 cursor-pointer shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden xs:inline">Print</span>
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 min-h-[44px] text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span className="hidden xs:inline">Close</span>
          </button>
        </div>
      </div>

      {/* ── Preview body ── */}
      <div className="print:p-0 p-4 xs:p-8 max-w-4xl mx-auto pb-16 print:pb-0">
        {isLoading ? (
          <div className="print:hidden flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading data…</p>
          </div>
        ) : (
          <>
            {view === 'planner' && renderPlannerView()}
            {view === 'goals' && renderGoalsView()}
            {view === 'calendar' && renderCalendarView()}
          </>
        )}
      </div>
    </div>
  );
};

export default PrintView;
