import { supabase } from '../utils/supabaseClient';
import { Goal } from '../types';
import { storage } from '../utils/storage';
import { recordSync } from './plannerApi';

interface GoalRow {
  id: string;
  title: string;
  description: string | null;
  target_value: number | string;
  current_value: number | string | null;
  unit: string;
  allow_exceed_target: boolean | null;
  created_at: string;
  updated_at: string;
}

// Postgres `numeric` columns come back from PostgREST as numbers or strings
// depending on magnitude, so normalise both.
const toGoal = (row: GoalRow): Goal => ({
  id: row.id,
  title: row.title,
  description: row.description ?? undefined,
  targetValue: Number(row.target_value),
  currentValue: Number(row.current_value ?? 0),
  unit: row.unit,
  allowExceedTarget: Boolean(row.allow_exceed_target),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const getGoals = async (userId: string): Promise<Goal[]> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const goals = (data || []).map(toGoal);
    saveLocalCache(userId, goals);
    return goals;
  } catch (err) {
    console.error('Error fetching goals:', err);
    return getLocalCache(userId);
  }
};

export const createGoal = async (userId: string, goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal | null> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        title: goal.title,
        description: goal.description || null,
        target_value: goal.targetValue,
        current_value: goal.currentValue,
        unit: goal.unit,
        allow_exceed_target: goal.allowExceedTarget
      })
      .select()
      .single();

    if (error) throw error;

    const newGoal = toGoal(data);
    saveLocalCache(userId, [...getLocalCache(userId), newGoal]);
    recordSync();
    return newGoal;
  } catch (err) {
    console.error('Error creating goal:', err);
    return null;
  }
};

/** `description` is only touched when the key is present; an empty value clears it. */
export const updateGoal = async (userId: string, goalId: string, updates: Partial<Goal>): Promise<Goal | null> => {
  try {
    const updateData: { title?: string; description?: string | null; target_value?: number; current_value?: number; unit?: string; allow_exceed_target?: boolean } = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if ('description' in updates) updateData.description = updates.description || null;
    if (updates.targetValue !== undefined) updateData.target_value = updates.targetValue;
    if (updates.currentValue !== undefined) updateData.current_value = updates.currentValue;
    if (updates.unit !== undefined) updateData.unit = updates.unit;
    if (updates.allowExceedTarget !== undefined) updateData.allow_exceed_target = updates.allowExceedTarget;

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    const updated = toGoal(data);
    saveLocalCache(userId, getLocalCache(userId).map(g => (g.id === goalId ? updated : g)));
    recordSync();
    return updated;
  } catch (err) {
    console.error('Error updating goal:', err);
    return null;
  }
};

export const deleteGoal = async (userId: string, goalId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (error) throw error;

    saveLocalCache(userId, getLocalCache(userId).filter(g => g.id !== goalId));
    recordSync();
    return true;
  } catch (err) {
    console.error('Error deleting goal:', err);
    return false;
  }
};

const saveLocalCache = (userId: string, goals: Goal[]) => {
  storage.save(storage.getUserKey('goals', userId), goals);
};

const getLocalCache = (userId: string): Goal[] => {
  const cached = storage.load<Goal[]>(storage.getUserKey('goals', userId), []);
  return Array.isArray(cached) ? cached : [];
};
