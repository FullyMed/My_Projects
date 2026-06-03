import React, { useState, useEffect } from 'react';
import { Plus, Target, Check, Trash2, TrendingUp, RotateCcw, Unlock, Lock } from 'lucide-react';
import { Goal, GoalStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useCompactMode } from '../hooks/useCompactMode';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../api/goalsApi';

const GoalTracker: React.FC = () => {
  const { isCompact } = useCompactMode();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: '',
    unit: 'times',
    allowExceedTarget: false,
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
    { value: 'kg', label: 'kg' },
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

  const addGoal = async () => {
    if (!newGoal.title.trim() || !newGoal.target || !user) return;

    const goal = await createGoal(user.id, {
      title: newGoal.title.trim(),
      description: newGoal.description.trim() || undefined,
      targetValue: parseInt(newGoal.target),
      currentValue: 0,
      unit: newGoal.unit,
      allowExceedTarget: newGoal.allowExceedTarget,
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
      setGoals(goals.map(g => (g.id === goalId ? updated : g)));
    }
  };

  const toggleAllowExceed = async (goalId: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updated = await updateGoal(user.id, goalId, { allowExceedTarget: !goal.allowExceedTarget });
    if (updated) {
      setGoals(goals.map(g => (g.id === goalId ? updated : g)));
    }
  };

  const resetProgress = async (goalId: string) => {
    if (!user) return;
    const updated = await updateGoal(user.id, goalId, { currentValue: 0 });
    if (updated) {
      setGoals(goals.map(g => (g.id === goalId ? updated : g)));
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
    if (allowExceed) return (current / target) * 100;
    return Math.min((current / target) * 100, 100);
  };

  const getGoalStatus = (goal: Goal): GoalStatus => {
    if (goal.currentValue === 0) return 'Not Started';
    if (goal.currentValue >= goal.targetValue) return 'Completed';
    return 'In Progress';
  };

  const completedCount = goals.filter(g => g.currentValue >= g.targetValue).length;
  const completionPct = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  const statusConfig: Record<GoalStatus, { label: string; classes: string }> = {
    'Completed': { label: 'Completed', classes: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50' },
    'In Progress': { label: 'In Progress', classes: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50' },
    'Not Started': { label: 'Not Started', classes: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700' },
  };

  const inputClass =
    'w-full px-3.5 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors min-h-[48px]';

  return (
    <div className={isCompact ? 'space-y-4' : 'space-y-6'}>
      {/* Analytics — 3 equal columns that shrink gracefully */}
      {goals.length > 0 && (
        <div className={`grid grid-cols-3 ${isCompact ? 'gap-2 xs:gap-3' : 'gap-3 xs:gap-4'}`}>
          {[
            { label: 'Total', value: goals.length, color: 'text-slate-900 dark:text-white' },
            { label: 'Completed', value: completedCount, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Progress', value: `${completionPct}%`, color: 'text-indigo-600 dark:text-indigo-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl px-2 xs:px-4 py-3 xs:py-4 shadow-card border border-slate-200 dark:border-slate-800 text-center">
              <p className={`text-xl xs:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 mt-0.5 xs:mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Goal Form */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200 dark:border-slate-800 ${isCompact ? 'p-4' : 'p-5'}`}>
        <h3 className={`font-semibold text-slate-900 dark:text-white ${isCompact ? 'text-sm mb-3' : 'text-sm mb-4'}`}>Create new goal</h3>
        <div className={`grid gap-3 ${isCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          <input
            type="text"
            value={newGoal.title}
            onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
            placeholder="Goal title (e.g. Exercise, Read books)"
            className={inputClass}
          />
          <input
            type="text"
            value={newGoal.description}
            onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
            placeholder="Description (optional)"
            className={inputClass}
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={newGoal.target}
              onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
              placeholder="Target"
              min="1"
              className={`${inputClass} flex-1`}
            />
            <select
              value={newGoal.unit}
              onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })}
              className="px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
            >
              {units.map(unit => (
                <option key={unit.value} value={unit.value}>{unit.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newGoal.allowExceedTarget}
                onChange={e => setNewGoal({ ...newGoal, allowExceedTarget: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Allow exceeding target</span>
            </label>
            <button
              onClick={addGoal}
              disabled={!newGoal.title.trim() || !newGoal.target}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer shadow-sm shadow-indigo-500/20"
            >
              <Plus className="h-4 w-4" />
              Add goal
            </button>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className={`grid ${isCompact ? 'gap-4 grid-cols-1 sm:grid-cols-2' : 'gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {goals.map(goal => {
            const progressPercentage = getProgressPercentage(goal.currentValue, goal.targetValue, goal.allowExceedTarget);
            const status = getGoalStatus(goal);
            const isComplete = goal.currentValue >= goal.targetValue;

            return (
              <div
                key={goal.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 ${
                  isComplete
                    ? 'border-emerald-300 dark:border-emerald-800/60 shadow-[0_2px_12px_rgba(16,185,129,0.10)]'
                    : 'border-slate-200 dark:border-slate-800 shadow-card'
                } ${isCompact ? 'p-4' : 'p-5'}`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isComplete ? 'bg-emerald-100 dark:bg-emerald-950/50' : 'bg-indigo-100 dark:bg-indigo-950/50'
                    }`}>
                      <Target className={`h-4 w-4 ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                    </div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{goal.title}</h3>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0 ml-2">
                    <button
                      onClick={() => setResetConfirmId(goal.id)}
                      className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-amber-500 transition-colors cursor-pointer"
                      title="Reset progress"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGoalHandler(goal.id)}
                      className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">{goal.description}</p>
                )}

                {/* Status badge */}
                <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border mb-3 ${statusConfig[status].classes}`}>
                  {statusConfig[status].label}
                </span>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isComplete
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : 'bg-gradient-to-r from-indigo-600 to-violet-500'
                      }`}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateGoalProgress(goal.id, -1)}
                      disabled={goal.currentValue <= 0}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      −1
                    </button>
                    <button
                      onClick={() => updateGoalProgress(goal.id, 1)}
                      className="px-3 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors cursor-pointer"
                    >
                      +1
                    </button>
                  </div>
                  {isComplete && (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">Done!</span>
                    </div>
                  )}
                </div>

                {/* Allow exceed toggle */}
                <button
                  onClick={() => toggleAllowExceed(goal.id)}
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    goal.allowExceedTarget
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800/50'
                  }`}
                >
                  {goal.allowExceedTarget ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {goal.allowExceedTarget ? 'Exceeding allowed' : 'Locked at target'}
                </button>

                {/* Reset confirmation */}
                {resetConfirmId === goal.id && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                    <p className="text-xs text-amber-700 dark:text-amber-300 mb-2 font-medium">Reset progress to 0?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => resetProgress(goal.id)}
                        className="flex-1 px-2 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setResetConfirmId(null)}
                        className="flex-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 shadow-card border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">No goals yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create your first goal to start tracking your progress.
          </p>
        </div>
      )}
    </div>
  );
};

export default GoalTracker;
