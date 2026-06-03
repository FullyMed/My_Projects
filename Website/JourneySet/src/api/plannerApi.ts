import { supabase } from '../utils/supabaseClient';
import { PlannerTask } from '../types';
import { storage } from '../utils/storage';

const SYNC_KEY = 'journeyset:v1:last_sync';

export const getPlannerTasks = async (userId: string, weekKey: string): Promise<PlannerTask[]> => {
  try {
    const { data, error } = await supabase
      .from('planner_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('week_key', weekKey)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const tasks = (data || []).map(t => ({
      id: t.id,
      title: t.title,
      dayKey: t.day_key,
      weekKey: t.week_key,
      time: t.time,
      completed: t.completed,
      recurring: t.recurring,
      createdAt: t.created_at,
      updatedAt: t.updated_at
    }));

    updateLocalCache(userId, tasks, 'planner');
    return tasks;
  } catch (err) {
    console.error('Error fetching planner tasks:', err);
    return getLocalCache(userId, 'planner');
  }
};

export const createPlannerTask = async (userId: string, task: Omit<PlannerTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlannerTask | null> => {
  try {
    const { data, error } = await supabase
      .from('planner_tasks')
      .insert({
        user_id: userId,
        title: task.title,
        day_key: task.dayKey,
        week_key: task.weekKey,
        time: task.time,
        completed: task.completed,
        recurring: task.recurring
      })
      .select()
      .single();

    if (error) throw error;

    const newTask = {
      id: data.id,
      title: data.title,
      dayKey: data.day_key,
      weekKey: data.week_key,
      time: data.time,
      completed: data.completed,
      recurring: data.recurring,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    recordSync();
    return newTask;
  } catch (err) {
    console.error('Error creating planner task:', err);
    return null;
  }
};

export const updatePlannerTask = async (userId: string, taskId: string, updates: Partial<PlannerTask>): Promise<PlannerTask | null> => {
  try {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.completed !== undefined) updateData.completed = updates.completed;
    if (updates.recurring) updateData.recurring = updates.recurring;

    const { data, error } = await supabase
      .from('planner_tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    const updated = {
      id: data.id,
      title: data.title,
      dayKey: data.day_key,
      weekKey: data.week_key,
      time: data.time,
      completed: data.completed,
      recurring: data.recurring,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    recordSync();
    return updated;
  } catch (err) {
    console.error('Error updating planner task:', err);
    return null;
  }
};

export const deletePlannerTask = async (userId: string, taskId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('planner_tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) throw error;

    recordSync();
    return true;
  } catch (err) {
    console.error('Error deleting planner task:', err);
    return false;
  }
};

const updateLocalCache = (userId: string, tasks: PlannerTask[], type: 'planner' | 'goals' | 'events') => {
  const key = storage.getUserKey(type, userId);
  storage.save(key, tasks);
};

const getLocalCache = (userId: string, type: 'planner' | 'goals' | 'events'): any[] => {
  const key = storage.getUserKey(type, userId);
  return storage.load(key, []);
};

export const recordSync = () => {
  storage.save(SYNC_KEY, new Date().toISOString());
};

export const getLastSync = (): string | null => {
  return storage.load(SYNC_KEY, null);
};
