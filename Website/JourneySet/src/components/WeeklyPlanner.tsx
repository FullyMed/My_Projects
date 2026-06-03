import React, { useState, useEffect } from 'react';
import { Plus, Clock, Check, Trash2, CreditCard as Edit3, Download, Copy, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { PlannerTask } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCompactMode } from '../contexts/CompactModeContext';
import { format, startOfWeek, addDays, isToday, subWeeks, addWeeks, getISOWeek, getISOWeekYear } from 'date-fns';
import { storage } from '../utils/storage';
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

  const saveTasks = (updatedTasks: PlannerTask[]) => {
    setTasks(updatedTasks);
  };

  const addTask = async () => {
    if (!newTask.trim() || !selectedDay || !user) return;

    const task = await createPlannerTask(user.id, {
      title: newTask.trim(),
      dayKey: selectedDay,
      weekKey: currentWeekKey,
      time: selectedTime || undefined,
      completed: false,
      recurring: selectedRecurring
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

    const updated = await updatePlannerTask(user.id, taskId, {
      completed: !task.completed
    });

    if (updated) {
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
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
    const newTask = await createPlannerTask(user.id, {
      title: task.title,
      dayKey: task.dayKey,
      weekKey: task.weekKey,
      time: task.time,
      completed: false,
      recurring: 'none'
    });

    if (newTask) {
      setTasks([...tasks, newTask]);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<PlannerTask>) => {
    if (!user) return;
    const updated = await updatePlannerTask(user.id, taskId, updates);
    if (updated) {
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
      setEditingTaskData(null);
    }
  };

  const getTasksForDay = (day: string) => {
    return tasks.filter(task => {
      if (task.dayKey !== day || task.weekKey !== currentWeekKey) return false;

      if (filter === 'completed') return task.completed;
      if (filter === 'incomplete') return !task.completed;
      return true;
    }).sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    const nextWeek = addWeeks(currentWeek, 1);
    const nextWeekKey = getWeekKey(nextWeek);
    const updatedTasks = [...tasks];

    tasks.forEach(task => {
      if (task.recurring === 'weekly' && task.weekKey === currentWeekKey) {
        const now = new Date().toISOString();
        const recurringTask: PlannerTask = {
          ...task,
          id: crypto.randomUUID(),
          weekKey: nextWeekKey,
          recurring: 'weekly',
          completed: false,
          createdAt: now,
          updatedAt: now
        };
        updatedTasks.push(recurringTask);
      }
    });

    if (updatedTasks.length > tasks.length) {
      saveTasks(updatedTasks);
    }
    setCurrentWeek(nextWeek);
  };

  const exportTasks = () => {
    const currentWeekTasks = tasks.filter(task => task.weekKey === currentWeekKey);

    const weekData = days.map(day => ({
      day,
      tasks: currentWeekTasks.filter(task => task.dayKey === day).sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time) return -1;
        if (b.time) return 1;
        return 0;
      })
    }));

    const content = weekData.map(({ day, tasks }) => {
      const taskList = tasks.map(task =>
        `  ${task.completed ? '✓' : '○'} ${task.title}${task.time ? ` (${task.time})` : ''}${task.recurring === 'weekly' ? ' [weekly]' : ''}`
      ).join('\n');
      return `${day}:\n${taskList || '  No tasks'}`;
    }).join('\n\n');

    const blob = new Blob([`Weekly Plan - ${format(currentWeek, 'MMMM dd, yyyy')} (Week ${currentWeekKey.split('-')[1]})\n\n${content}`], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-plan-${currentWeekKey}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDayDate = (dayIndex: number) => addDays(currentWeek, dayIndex);

  const weekTaskCount = tasks.filter(task => task.weekKey === currentWeekKey).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousWeek}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Week of {format(currentWeek, 'MMMM dd, yyyy')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentWeekKey} • {weekTaskCount} task{weekTaskCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <button
          onClick={exportTasks}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          aria-label="Export week as file"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>Export Week</span>
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {(['all', 'completed', 'incomplete'] as const).map(filterOption => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors capitalize ${
              filter === filterOption
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">{filterOption}</span>
          </button>
        ))}
      </div>

      {/* Add Task Form */}
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${isCompact ? 'p-4' : 'p-6'}`}>
        <h3 className={`font-semibold text-gray-900 dark:text-white mb-4 ${isCompact ? 'text-base' : 'text-lg'}`}>Add New Task</h3>
        <div className={`grid gap-4 ${isCompact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-5'}`}>
          <div className="md:col-span-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter your task..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
          </div>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Day</option>
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={selectedRecurring}
            onChange={(e) => setSelectedRecurring(e.target.value as 'none' | 'weekly')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="none">No Repeat</option>
            <option value="weekly">Weekly</option>
          </select>
          <button
            onClick={addTask}
            disabled={!newTask.trim() || !selectedDay}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className={`grid gap-4 ${isCompact ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6'}`}>
        {days.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const dayDate = getDayDate(index);
          const isCurrentDay = isToday(dayDate);

          return (
            <div
              key={day}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all ${
                isCurrentDay
                  ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20'
                  : 'border-gray-200 dark:border-gray-700'
              } ${isCompact ? 'p-4' : 'p-6'}`}
            >
              <div className={`flex items-center justify-between ${isCompact ? 'mb-3' : 'mb-4'}`}>
                <div>
                  <h3 className={`font-semibold ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'} ${isCompact ? 'text-sm' : ''}`}>
                    {day}
                  </h3>
                  <p className={`text-gray-500 dark:text-gray-400 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                    {format(dayDate, 'MMM dd')}
                  </p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2">
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border transition-all ${
                      task.completed
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-0.5 p-1 rounded transition-colors ${
                          task.completed
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${
                            task.completed
                              ? 'text-green-700 dark:text-green-300 line-through'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {task.title}
                          </p>
                          {task.recurring === 'weekly' && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                              weekly
                            </span>
                          )}
                        </div>
                        {task.time && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {task.time}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setEditingTaskData(task)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => duplicateTask(task)}
                          className="p-1 text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {dayTasks.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                    No tasks planned
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
          onSave={(updates) => updateTask(editingTaskData.id, updates)}
          onClose={() => setEditingTaskData(null)}
        />
      )}
    </div>
  );
};

export default WeeklyPlanner;
