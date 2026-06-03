import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { PlannerTask, Goal, Event } from '../types';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { getCategoryLabel, getCategoryColor } from '../constants/categories';

interface PrintViewProps {
  view: 'planner' | 'goals' | 'calendar';
  onClose: () => void;
}

const PrintView: React.FC<PrintViewProps> = ({ view, onClose }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    if (!user) return;

    if (view === 'planner' || view === 'calendar') {
      const plannerKey = storage.getUserKey('planner', user.id);
      const storedTasks = storage.load<PlannerTask[]>(plannerKey as any, []);
      setTasks(storedTasks);
    }

    if (view === 'goals') {
      const goalsKey = storage.getUserKey('goals', user.id);
      const storedGoals = storage.load<Goal[]>(goalsKey as any, []);
      setGoals(storedGoals);
    }

    if (view === 'calendar') {
      const eventsKey = storage.getUserKey('events', user.id);
      const storedEvents = storage.load<Event[]>(eventsKey as any, []);
      setEvents(storedEvents);
    }
  }, [user, view]);

  const renderPlannerView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const dayKeys = days.map(d => format(d, 'yyyy-MM-dd'));

    return (
      <div className="print-content">
        <h1 className="print-title">Weekly Planner</h1>
        <p className="print-date">
          Week of {format(weekStart, 'MMMM d, yyyy')}
        </p>

        <table className="print-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Tasks</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, idx) => {
              const dayKey = dayKeys[idx];
              const dayTasks = tasks.filter(t => t.dayKey === dayKey);
              return (
                <tr key={dayKey}>
                  <td className="day-cell">
                    <strong>{format(day, 'EEE')}</strong>
                    <div className="text-sm">{format(day, 'MMM d')}</div>
                  </td>
                  <td>
                    {dayTasks.length === 0 ? (
                      <span className="text-gray-500">No tasks</span>
                    ) : (
                      <ul className="task-list">
                        {dayTasks.map(task => (
                          <li key={task.id} className={task.completed ? 'completed' : ''}>
                            {task.time && <span className="task-time">{task.time}</span>}
                            {task.title}
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
      </div>
    );
  };

  const renderGoalsView = () => {
    return (
      <div className="print-content">
        <h1 className="print-title">Goal Tracker</h1>
        <p className="print-date">{format(currentDate, 'MMMM d, yyyy')}</p>

        <div className="goals-list">
          {goals.length === 0 ? (
            <p className="text-gray-500">No goals tracked.</p>
          ) : (
            goals.map(goal => {
              const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
              const status = goal.currentValue >= goal.targetValue ? 'Completed' : 'In Progress';

              return (
                <div key={goal.id} className="goal-item">
                  <div className="goal-header">
                    <h3>{goal.title}</h3>
                    <span className="goal-status">{status}</span>
                  </div>
                  {goal.description && <p className="goal-description">{goal.description}</p>}
                  <div className="progress-section">
                    <div className="progress-info">
                      <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                      <span className="progress-percent">{Math.round(progress)}%</span>
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
            })
          )}
        </div>
      </div>
    );
  };

  const renderCalendarView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthEvents = events.filter(e => {
      const eventDate = new Date(e.dateISO);
      return eventDate >= monthStart && eventDate <= monthEnd;
    });

    const sortedEvents = [...monthEvents].sort((a, b) =>
      new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    );

    return (
      <div className="print-content">
        <h1 className="print-title">Event Calendar</h1>
        <p className="print-date">{format(currentDate, 'MMMM yyyy')}</p>

        <div className="events-list">
          {sortedEvents.length === 0 ? (
            <p className="text-gray-500">No events this month.</p>
          ) : (
            sortedEvents.map(event => (
              <div key={event.id} className="event-item">
                <div className="event-date">
                  <strong>{format(new Date(event.dateISO), 'MMM d')}</strong>
                  {event.time && <span className="event-time">{event.time}</span>}
                </div>
                <div className="event-details">
                  <h4>{event.title}</h4>
                  <span className="event-category">{getCategoryLabel(event.category)}</span>
                  {event.description && <p>{event.description}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const getTitle = () => {
    switch (view) {
      case 'planner':
        return 'Weekly Planner - Print';
      case 'goals':
        return 'Goal Tracker - Print';
      case 'calendar':
        return 'Event Calendar - Print';
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-auto print:static">
      <div className="print:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{getTitle()}</h1>
        <div className="space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      <div className="print:p-0 pt-20 p-8 max-w-4xl mx-auto">
        {view === 'planner' && renderPlannerView()}
        {view === 'goals' && renderGoalsView()}
        {view === 'calendar' && renderCalendarView()}
      </div>
    </div>
  );
};

export default PrintView;
