import { supabase } from '../utils/supabaseClient';
import { Goal } from '../types';
import { storage } from '../utils/storage';
import { recordSync } from './plannerApi';

export const getGoals = async (userId: string): Promise<Goal[]> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const goals = (data || []).map(g => ({
      id: g.id,
      title: g.title,
      description: g.description,
      targetValue: parseFloat(g.target_value),
      currentValue: parseFloat(g.current_value),
      unit: g.unit,
      allowExceedTarget: g.allow_exceed_target,
      createdAt: g.created_at,
      updatedAt: g.updated_at
    }));

    updateLocalCache(userId, goals);
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
        description: goal.description,
        target_value: goal.targetValue,
        current_value: goal.currentValue,
        unit: goal.unit,
        allow_exceed_target: goal.allowExceedTarget
      })
      .select()
      .single();

    if (error) throw error;

    const newGoal = {
      id: data.id,
      title: data.title,
      description: data.description,
      targetValue: parseFloat(data.target_value),
      currentValue: parseFloat(data.current_value),
      unit: data.unit,
      allowExceedTarget: data.allow_exceed_target,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    recordSync();
    return newGoal;
  } catch (err) {
    console.error('Error creating goal:', err);
    return null;
  }
};

export const updateGoal = async (userId: string, goalId: string, updates: Partial<Goal>): Promise<Goal | null> => {
  try {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.targetValue !== undefined) updateData.target_value = updates.targetValue;
    if (updates.currentValue !== undefined) updateData.current_value = updates.currentValue;
    if (updates.unit) updateData.unit = updates.unit;
    if (updates.allowExceedTarget !== undefined) updateData.allow_exceed_target = updates.allowExceedTarget;

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    const updated = {
      id: data.id,
      title: data.title,
      description: data.description,
      targetValue: parseFloat(data.target_value),
      currentValue: parseFloat(data.current_value),
      unit: data.unit,
      allowExceedTarget: data.allow_exceed_target,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

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

    recordSync();
    return true;
  } catch (err) {
    console.error('Error deleting goal:', err);
    return false;
  }
};

const updateLocalCache = (userId: string, goals: Goal[]) => {
  const key = storage.getUserKey('goals', userId);
  storage.save(key, goals);
};

const getLocalCache = (userId: string): Goal[] => {
  const key = storage.getUserKey('goals', userId);
  return storage.load(key, []);
};
