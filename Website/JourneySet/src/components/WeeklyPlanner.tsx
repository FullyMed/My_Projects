import React, { useState, useEffect } from 'react';
import { Plus, Clock, Check, Trash2, CreditCard as Edit3, Download, Copy, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { PlannerTask } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCompactMode } from '../contexts/CompactModeContext';
import { format, startOfWeek, addDays, isToday, subWeeks, addWeeks, getISOWeek, getISOWeekYear } from 'date-fns';
import EditTaskModal from './EditTaskModal';
import { getPlannerTasks, createPlannerTask, updatePlannerTask, deletePlannerTask } from '../api/plannerApi';

const WeeklyPlanner: React.FC = () => {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedRecurring, setSelectedRecurring] = useState<'none' | 'weekly'>('none');
  const [editingTaskData, setEditingTaskData] = useState<PlannerTask | null>(null);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const { user } = useAuth();
  const { isCompact } = useCompactMode();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getWeekKey = (date: Date): string => {
    const year = getISOWeekYear(date);
    const week = getISOWeek(date);
    return `${year}-W${String(week).padStart(2, '0')}`;
  };

  const currentWeekKey = getWeekKey(currentWeek);

  useEffect(() => {
    if (user) {
      const loadTasks = async () => {
        const weekTasks = await getPlannerTasks(user.id, currentWeekKey);
        setTasks(weekTasks);
      };
      loadTasks();
    }
  }, [user, currentWeekKey]);

  const addTask = async () => {
    if (!newTask.trim() || !selectedDay || !user) return;

    const task = await createPlannerTask(user.id, {
      title: newTask.trim(),
      dayKey: selectedDay,
      weekKey: currentWeekKey,
      time: selectedTime || undefined,
      completed: false,
      recurring: selectedRecurring,
    });

    if (task) {
      setTasks([...tasks, task]);
      setNewTask('');
      setSelectedDay('');
      setSelectedTime('');
      setSelectedRecurring('none');
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated = await updatePlannerTask(user.id, taskId, { completed: !task.completed });
    if (updated) {
      setTasks(tasks.map(t => (t.id === taskId ? updated : t)));
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    const success = await deletePlannerTask(user.id, taskId);
    if (success) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const duplicateTask = async (task: PlannerTask) => {
    if (!user) return;
    const dup = await createPlannerTask(user.id, {
      title: task.title,
      dayKey: task.dayKey,
      weekKey: task.weekKey,
      time: task.time,
      completed: false,
      recurring: 'none',
    });
    if (dup) {
      setTasks([...tasks, dup]);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<PlannerTask>) => {
    if (!user) return;
    const updated = await updatePlannerTask(user.id, taskId, updates);
    if (updated) {
      setTasks(tasks.map(t => (t.id === taskId ? updated : t)));
      setEditingTaskData(null);
    }
  };

  const getTasksForDay = (day: string) =>
    tasks
      .filter(task => {
        if (task.dayKey !== day || task.weekKey !== currentWeekKey) return false;
        if (filter === 'completed') return task.completed;
        if (filter === 'incomplete') return !task.completed;
        return true;
      })
      .sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time) return -1;
        if (b.time) return 1;
        return 0;
      });

  const handlePreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));

  const handleNextWeek = async () => {
    const nextWeek = addWeeks(currentWeek, 1);
    const nextWeekKey = getWeekKey(nextWeek);

    if (user) {
      const recurringTasks = tasks.filter(
        task => task.recurring === 'weekly' && task.weekKey === currentWeekKey
      );
      await Promise.all(
        recurringTasks.map(task =>
          createPlannerTask(user.id, {
            title: task.title,
            dayKey: task.dayKey,
            weekKey: nextWeekKey,
            time: task.time,
            completed: false,
            recurring: 'weekly',
          })
        )
      );
    }

    setCurrentWeek(nextWeek);
  };

  const exportTasks = () => {
    const currentWeekTasks = tasks.filter(task => task.weekKey === currentWeekKey);
    const weekData = days.map(day => ({
      day,
      tasks: currentWeekTasks
        .filter(task => task.dayKey === day)
        .sort((a, b) => {
          if (a.time && b.time) return a.time.localeCompare(b.time);
          if (a.time) return -1;
          if (b.time) return 1;
          return 0;
        }),
    }));

    const content = weekData
      .map(({ day, tasks }) => {
        const taskList = tasks
          .map(
            task =>
              `  ${task.completed ? '✓' : '○'} ${task.title}${task.time ? ` (${task.time})` : ''}${task.recurring === 'weekly' ? ' [weekly]' : ''}`
          )
          .join('\n');
        return `${day}:\n${taskList || '  No tasks'}`;
      })
      .join('\n\n');

    const blob = new Blob(
      [`Weekly Plan - ${format(currentWeek, 'MMMM dd, yyyy')} (Week ${currentWeekKey.split('-')[1]})\n\n${content}`],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-plan-${currentWeekKey}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDayDate = (dayIndex: number) => addDays(currentWeek, dayIndex);
  const weekTaskCount = tasks.filter(task => task.weekKey === currentWeekKey).length;

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 xs:gap-2 min-w-0">
          <button
            onClick={handlePreviousWeek}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-base xs:text-lg font-bold text-slate-900 dark:text-white truncate">
              {format(currentWeek, 'MMM d')}
              <span className="hidden xs:inline">{format(currentWeek, ', yyyy')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentWeekKey} · {weekTaskCount} task{weekTaskCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleNextWeek}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={exportTasks}
          className="inline-flex items-center gap-2 px-3 xs:px-4 min-h-[44px] text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
        >
          <Download className="h-4 w-4" />
          <span className="hidden xs:inline">Export week</span>
          <span className="xs:hidden">Export</span>
        </button>
      </div>

      {/* Filter Buttons — horizontal scroll on small screens */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {(['all', 'completed', 'incomplete'] as const).map(filterOption => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg text-xs font-medium transition-colors capitalize cursor-pointer whitespace-nowrap flex-shrink-0 ${
              filter === filterOption
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
          >
            <Filter className="h-3 w-3" />
            {filterOption}
          </button>
        ))}
      </div>

      {/* Add Task Form */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card ${isCompact ? 'p-4' : 'p-5'}`}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Add new task</h3>
        {/* Mobile: stacked single column; md+: 5-column grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-5 gap-3">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="Task title…"
            className={`${inputClass} xs:col-span-2 md:col-span-2`}
            onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <select
            value={selectedDay}
            onChange={e => setSelectedDay(e.target.value)}
            className={inputClass}
          >
            <option value="">Select day</option>
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <input
            type="time"
            value={selectedTime}
            onChange={e => setSelectedTime(e.target.value)}
            className={inputClass}
          />
          <div className="flex gap-2 xs:col-span-2 md:col-span-1">
            <select
              value={selectedRecurring}
              onChange={e => setSelectedRecurring(e.target.value as 'none' | 'weekly')}
              className={`${inputClass} flex-1`}
            >
              <option value="none">No repeat</option>
              <option value="weekly">Weekly</option>
            </select>
            <button
              onClick={addTask}
              disabled={!newTask.trim() || !selectedDay}
              className="inline-flex items-center justify-center w-[48px] flex-shrink-0 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-lg transition-all duration-200 cursor-pointer shadow-sm shadow-indigo-500/20"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className={`grid gap-4 ${isCompact ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`}>
        {days.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const dayDate = getDayDate(index);
          const isCurrentDay = isToday(dayDate);

          return (
            <div
              key={day}
              className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 ${
                isCurrentDay
                  ? 'border-indigo-300 dark:border-indigo-700 shadow-card'
                  : 'border-slate-200 dark:border-slate-800'
              } ${isCompact ? 'p-4' : 'p-5'}`}
            >
              <div className={`flex items-center justify-between ${isCompact ? 'mb-3' : 'mb-4'}`}>
                <div>
                  <h3 className={`font-semibold text-sm ${isCurrentDay ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                    {day}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {format(dayDate, 'MMM d')}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isCurrentDay
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {dayTasks.length}
                </span>
              </div>

              <div className="space-y-2">
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-all duration-150 ${
                      task.completed
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 cursor-pointer ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500'
                        }`}
                      >
                        {task.completed && <Check className="h-3 w-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className={`text-sm leading-snug ${
                            task.completed
                              ? 'text-slate-400 dark:text-slate-500 line-through'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {task.title}
                          </p>
                          {task.recurring === 'weekly' && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded font-medium">
                              weekly
                            </span>
                          )}
                        </div>
                        {task.time && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">{task.time}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => setEditingTaskData(task)}
                          className="p-1 text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => duplicateTask(task)}
                          className="p-1 text-slate-300 dark:text-slate-600 hover:text-sky-500 dark:hover:text-sky-400 transition-colors cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {dayTasks.length === 0 && (
                  <p className="text-center text-slate-400 dark:text-slate-600 text-xs py-6">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingTaskData && (
        <EditTaskModal
          task={editingTaskData}
          days={days}
          onSave={updates => updateTask(editingTaskData.id, updates)}
          onClose={() => setEditingTaskData(null)}
        />
      )}
    </div>
  );
};

export default WeeklyPlanner;
