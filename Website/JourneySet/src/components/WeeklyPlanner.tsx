import { addDays, format, isToday, startOfWeek } from 'date-fns';
import { Check, Clock, Download, Edit3, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Task } from '../types';

const WeeklyPlanner: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { user } = useAuth();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = () => {
    if (!user) return;
    const storedTasks = localStorage.getItem(`journeysetTasks_${user.id}`);
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  };

  const saveTasks = (updatedTasks: Task[]) => {
    if (!user) return;
    localStorage.setItem(`journeysetTasks_${user.id}`, JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const addTask = () => {
    if (!newTask.trim() || !selectedDay || !user) return;

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      day: selectedDay,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      completed: false,
      userId: user.id,
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, task];
    saveTasks(updatedTasks);
    setNewTask('');
    setSelectedDay('');
    setStartTime('');
    setEndTime('');
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
  };

  const updateTask = (taskId: string, newText: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, text: newText } : task
    );
    saveTasks(updatedTasks);
    setEditingTask(null);
  };

  const getTasksForDay = (day: string) => {
    return tasks.filter(task => task.day === day).sort((a, b) => {
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
      if (a.startTime) return -1;
      if (b.startTime) return 1;
      return 0;
    });
  };

  const exportTasks = () => {
    const weekData = days.map(day => ({
      day,
      tasks: getTasksForDay(day)
    }));

    const content = weekData.map(({ day, tasks }) => {
      const taskList = tasks.map(task => 
        `  ${task.completed ? '✓' : '○'} ${task.text}${task.startTime ? ` (${task.startTime}${task.endTime ? ` - ${task.endTime}` : ''})` : ''}`
      ).join('\n');
      return `${day}:\n${taskList || '  No tasks'}`;
    }).join('\n\n');

    const blob = new Blob([`Weekly Plan - ${format(currentWeek, 'MMM dd, yyyy')}\n\n${content}`], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-plan-${format(currentWeek, 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDayDate = (dayIndex: number) => addDays(currentWeek, dayIndex);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Week of {format(currentWeek, 'MMMM dd, yyyy')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Plan your tasks for each day of the week
          </p>
        </div>
        <button
          onClick={exportTasks}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Task</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter your task..."
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
          </div>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Day</option>
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Start time"
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="End time"
            />
            <button
              onClick={addTask}
              disabled={!newTask.trim() || !selectedDay}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {days.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const dayDate = getDayDate(index);
          const isCurrentDay = isToday(dayDate);

          return (
            <div
              key={day}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border transition-all ${
                isCurrentDay 
                  ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`font-semibold ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                    {day}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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
                        {editingTask === task.id ? (
                          <input
                            type="text"
                            defaultValue={task.text}
                            className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            onBlur={(e) => updateTask(task.id, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                updateTask(task.id, (e.target as HTMLInputElement).value);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <p className={`text-sm ${
                            task.completed
                              ? 'text-green-700 dark:text-green-300 line-through'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {task.text}
                          </p>
                        )}
                        {task.startTime && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {task.endTime
                                ? `${task.startTime} - ${task.endTime}`
                                : task.startTime}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setEditingTask(task.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
    </div>
  );
};

export default WeeklyPlanner;