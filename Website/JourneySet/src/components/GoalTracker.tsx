import React, { useState, useEffect } from 'react';
import { Plus, Target, Check, Edit3, Trash2, TrendingUp } from 'lucide-react';
import { Goal } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfWeek, addWeeks, isSameWeek } from 'date-fns';

const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: '',
    unit: 'times'
  });
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { user } = useAuth();

  const units = [
    { value: 'times', label: 'times' },
    { value: 'hours', label: 'hours' },
    { value: 'minutes', label: 'minutes' },
    { value: 'days', label: 'days' },
    { value: 'pages', label: 'pages' },
    { value: 'miles', label: 'miles' },
    { value: 'kg', label: 'kg' }
  ];

  useEffect(() => {
    loadGoals();
  }, [user]);

  const loadGoals = () => {
    if (!user) return;
    const storedGoals = localStorage.getItem(`journeysetGoals_${user.id}`);
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  };

  const saveGoals = (updatedGoals: Goal[]) => {
    if (!user) return;
    localStorage.setItem(`journeysetGoals_${user.id}`, JSON.stringify(updatedGoals));
    setGoals(updatedGoals);
  };

  const addGoal = () => {
    if (!newGoal.title.trim() || !newGoal.target || !user) return;

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title.trim(),
      description: newGoal.description.trim(),
      target: parseInt(newGoal.target),
      current: 0,
      unit: newGoal.unit,
      completed: false,
      userId: user.id,
      weekStart: format(currentWeek, 'yyyy-MM-dd')
    };

    const updatedGoals = [...goals, goal];
    saveGoals(updatedGoals);
    setNewGoal({ title: '', description: '', target: '', unit: 'times' });
  };

  const updateGoalProgress = (goalId: string, increment: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const newCurrent = Math.max(0, goal.current + increment);
        const newCompleted = newCurrent >= goal.target;
        return { ...goal, current: newCurrent, completed: newCompleted };
      }
      return goal;
    });
    saveGoals(updatedGoals);
  };

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    saveGoals(updatedGoals);
  };

  const getCurrentWeekGoals = () => {
    const weekStart = format(currentWeek, 'yyyy-MM-dd');
    return goals.filter(goal => goal.weekStart === weekStart);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getCompletedGoalsCount = () => {
    return getCurrentWeekGoals().filter(goal => goal.completed).length;
  };

  const getTotalGoalsCount = () => {
    return getCurrentWeekGoals().length;
  };

  const currentWeekGoals = getCurrentWeekGoals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Weekly Goals
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Set and track your weekly targets
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getCompletedGoalsCount()}/{getTotalGoalsCount()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Goal Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Goal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="Goal title (e.g., Exercise, Read books)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <input
              type="text"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex space-x-2">
            <input
              type="number"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
              placeholder="Target"
              min="1"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <select
              value={newGoal.unit}
              onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {units.map(unit => (
                <option key={unit.value} value={unit.value}>{unit.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              onClick={addGoal}
              disabled={!newGoal.title.trim() || !newGoal.target}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {currentWeekGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentWeekGoals.map(goal => {
            const progressPercentage = getProgressPercentage(goal.current, goal.target);
            
            return (
              <div
                key={goal.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border transition-all ${
                  goal.completed 
                    ? 'border-green-500 dark:border-green-400 ring-2 ring-green-500/20' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Target className={`h-6 w-6 ${goal.completed ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {goal.description}
                  </p>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        goal.completed 
                          ? 'bg-green-600 dark:bg-green-400' 
                          : 'bg-blue-600 dark:bg-blue-400'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="mt-1 text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateGoalProgress(goal.id, -1)}
                      disabled={goal.current <= 0}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-50 disabled:dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded transition-colors text-sm"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => updateGoalProgress(goal.id, 1)}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded transition-colors text-sm"
                    >
                      +1
                    </button>
                  </div>
                  {goal.completed && (
                    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Completed!</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Goals Set</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create your first goal to start tracking your weekly progress.
          </p>
        </div>
      )}
    </div>
  );
};

export default GoalTracker;