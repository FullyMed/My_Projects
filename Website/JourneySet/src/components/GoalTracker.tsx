import React, { useState, useEffect } from 'react';
import { Plus, Target, Check, Trash2, TrendingUp, RotateCcw, Lock } from 'lucide-react';
import { Goal, GoalStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCompactMode } from '../contexts/CompactModeContext';
import { storage } from '../utils/storage';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../api/goalsApi';

const GoalTracker: React.FC = () => {
  const { isCompact } = useCompactMode();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: '',
    unit: 'times',
    allowExceedTarget: false
  });
  const [resetConfirmId, setResetConfirmId] = useState<string | null>(null);
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
    if (user) {
      const loadGoals = async () => {
        const userGoals = await getGoals(user.id);
        setGoals(userGoals);
      };
      loadGoals();
    }
  }, [user]);

  const saveGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
  };

  const addGoal = async () => {
    if (!newGoal.title.trim() || !newGoal.target || !user) return;

    const goal = await createGoal(user.id, {
      title: newGoal.title.trim(),
      description: newGoal.description.trim() || undefined,
      targetValue: parseInt(newGoal.target),
      currentValue: 0,
      unit: newGoal.unit,
      allowExceedTarget: newGoal.allowExceedTarget
    });

    if (goal) {
      setGoals([...goals, goal]);
      setNewGoal({ title: '', description: '', target: '', unit: 'times', allowExceedTarget: false });
    }
  };

  const updateGoalProgress = async (goalId: string, increment: number) => {
    if (!user) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    let newCurrentValue = goal.currentValue + increment;
    if (!goal.allowExceedTarget) {
      newCurrentValue = Math.max(0, Math.min(newCurrentValue, goal.targetValue));
    } else {
      newCurrentValue = Math.max(0, newCurrentValue);
    }

    const updated = await updateGoal(user.id, goalId, { currentValue: newCurrentValue });
    if (updated) {
      setGoals(goals.map(g => g.id === goalId ? updated : g));
    }
  };

  const toggleAllowExceed = async (goalId: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updated = await updateGoal(user.id, goalId, { allowExceedTarget: !goal.allowExceedTarget });
    if (updated) {
      setGoals(goals.map(g => g.id === goalId ? updated : g));
    }
  };

  const resetProgress = async (goalId: string) => {
    if (!user) return;
    const updated = await updateGoal(user.id, goalId, { currentValue: 0 });
    if (updated) {
      setGoals(goals.map(g => g.id === goalId ? updated : g));
      setResetConfirmId(null);
    }
  };

  const deleteGoalHandler = async (goalId: string) => {
    if (!user) return;
    const success = await deleteGoal(user.id, goalId);
    if (success) {
      setGoals(goals.filter(goal => goal.id !== goalId));
    }
  };

  const getProgressPercentage = (current: number, target: number, allowExceed: boolean) => {
    if (allowExceed) {
      return (current / target) * 100;
    }
    return Math.min((current / target) * 100, 100);
  };

  const getGoalStatus = (goal: Goal): GoalStatus => {
    if (goal.currentValue === 0) return 'Not Started';
    if (goal.currentValue >= goal.targetValue) return 'Completed';
    return 'In Progress';
  };

  const getCompletedGoalsCount = () => {
    return goals.filter(goal => goal.currentValue >= goal.targetValue).length;
  };

  const getTotalGoalsCount = () => {
    return goals.length;
  };

  const getCompletionPercentage = () => {
    if (getTotalGoalsCount() === 0) return 0;
    return Math.round((getCompletedGoalsCount() / getTotalGoalsCount()) * 100);
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'In Progress':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'Not Started':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className={`space-y-${isCompact ? '4' : '6'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`font-bold text-gray-900 dark:text-white ${isCompact ? 'text-xl' : 'text-2xl'}`}>
            Weekly Goals
          </h2>
          <p className={`text-gray-600 dark:text-gray-400 ${isCompact ? 'text-sm' : ''}`}>
            Set and track your weekly targets
          </p>
        </div>
      </div>

      {/* Summary Analytics */}
      {goals.length > 0 && (
        <div className={`grid grid-cols-3 gap-${isCompact ? '3' : '4'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {getTotalGoalsCount()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Goals</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {getCompletedGoalsCount()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getCompletionPercentage()}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completion</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Form */}
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${isCompact ? 'p-4' : 'p-6'}`}>
        <h3 className={`font-semibold text-gray-900 dark:text-white ${isCompact ? 'text-base mb-3' : 'text-lg mb-4'}`}>Create New Goal</h3>
        <div className={`grid gap-4 ${isCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
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
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newGoal.allowExceedTarget}
                onChange={(e) => setNewGoal({ ...newGoal, allowExceedTarget: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Allow exceeding target</span>
            </label>
            <button
              onClick={addGoal}
              disabled={!newGoal.title.trim() || !newGoal.target}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors ml-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className={`grid gap-${isCompact ? '4' : '6'} ${isCompact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {goals.map(goal => {
            const progressPercentage = getProgressPercentage(goal.currentValue, goal.targetValue, goal.allowExceedTarget);
            const status = getGoalStatus(goal);

            return (
              <div
                key={goal.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all ${
                  goal.currentValue >= goal.targetValue
                    ? 'border-green-500 dark:border-green-400 ring-2 ring-green-500/20'
                    : 'border-gray-200 dark:border-gray-700'
                } ${isCompact ? 'p-4' : 'p-6'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Target className={`h-6 w-6 flex-shrink-0 ${goal.currentValue >= goal.targetValue ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{goal.title}</h3>
                  </div>
                  <div className="flex space-x-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => setResetConfirmId(goal.id)}
                      className="p-1 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      title="Reset progress"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteGoalHandler(goal.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {goal.description}
                  </p>
                )}

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        goal.currentValue >= goal.targetValue
                          ? 'bg-green-600 dark:bg-green-400'
                          : 'bg-blue-600 dark:bg-blue-400'
                      }`}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateGoalProgress(goal.id, -1)}
                      disabled={goal.currentValue <= 0}
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
                  {goal.currentValue >= goal.targetValue && (
                    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Done!</span>
                    </div>
                  )}
                </div>

                {/* Allow Exceed Toggle */}
                <button
                  onClick={() => toggleAllowExceed(goal.id)}
                  className={`w-full flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                    goal.allowExceedTarget
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Lock className="h-3 w-3" />
                  <span>{goal.allowExceedTarget ? 'Exceeding allowed' : 'Locked at target'}</span>
                </button>

                {/* Reset Confirmation */}
                {resetConfirmId === goal.id && (
                  <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <p className="text-xs text-orange-700 dark:text-orange-300 mb-2">Reset progress to 0?</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => resetProgress(goal.id)}
                        className="flex-1 px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setResetConfirmId(null)}
                        className="flex-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
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
