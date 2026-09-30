import { supabase } from '../utils/supabaseClient';
import { PlannerTask } from '../types';
import { storage } from '../utils/storage';

const SYNC_KEY = 'journeyset:v1:last_sync';

interface PlannerTaskRow {
  id: string;
  title: string;
  day_key: string;
  week_key: string;
  time: string | null;
  completed: boolean;
  recurring: PlannerTask['recurring'];
  created_at: string;
  updated_at: string;
}

const toTask = (row: PlannerTaskRow): PlannerTask => ({
  id: row.id,
  title: row.title,
  dayKey: row.day_key,
  weekKey: row.week_key,
  time: row.time ?? undefined,
  completed: row.completed,
  recurring: row.recurring,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const getPlannerTasks = async (userId: string, weekKey: string): Promise<PlannerTask[]> => {
  try {
    const { data, error } = await supabase
      .from('planner_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('week_key', weekKey)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const tasks = (data || []).map(toTask);
    replaceCachedWeek(userId, weekKey, tasks);
    return tasks;
  } catch (err) {
    console.error('Error fetching planner tasks:', err);
    return getLocalCache(userId).filter(t => t.weekKey === weekKey);
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
        time: task.time || null,
        completed: task.completed,
        recurring: task.recurring
      })
      .select()
      .single();

    if (error) throw error;

    const newTask = toTask(data);
    upsertCachedTask(userId, newTask);
    recordSync();
    return newTask;
  } catch (err) {
    console.error('Error creating planner task:', err);
    return null;
  }
};

/**
 * `time` is only touched when the key is present in `updates`; passing
 * `time: undefined` (or an empty string) clears it.
 */
export const updatePlannerTask = async (userId: string, taskId: string, updates: Partial<PlannerTask>): Promise<PlannerTask | null> => {
  try {
    const updateData: { title?: string; day_key?: string; time?: string | null; completed?: boolean; recurring?: string } = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.dayKey !== undefined) updateData.day_key = updates.dayKey;
    if ('time' in updates) updateData.time = updates.time || null;
    if (updates.completed !== undefined) updateData.completed = updates.completed;
    if (updates.recurring !== undefined) updateData.recurring = updates.recurring;

    const { data, error } = await supabase
      .from('planner_tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    const updated = toTask(data);
    upsertCachedTask(userId, updated);
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

    saveLocalCache(userId, getLocalCache(userId).filter(t => t.id !== taskId));
    recordSync();
    return true;
  } catch (err) {
    console.error('Error deleting planner task:', err);
    return false;
  }
};

/*
 * The planner cache holds tasks from every week that has been fetched, so the
 * offline fallback can return the right week instead of whichever week was
 * loaded last. Each successful fetch replaces only that week's slice.
 */
const getLocalCache = (userId: string): PlannerTask[] => {
  const cached = storage.load<PlannerTask[]>(storage.getUserKey('planner', userId), []);
  return Array.isArray(cached) ? cached : [];
};

const saveLocalCache = (userId: string, tasks: PlannerTask[]) => {
  storage.save(storage.getUserKey('planner', userId), tasks);
};

const replaceCachedWeek = (userId: string, weekKey: string, tasks: PlannerTask[]) => {
  saveLocalCache(userId, [...getLocalCache(userId).filter(t => t.weekKey !== weekKey), ...tasks]);
};

const upsertCachedTask = (userId: string, task: PlannerTask) => {
  const cached = getLocalCache(userId);
  const exists = cached.some(t => t.id === task.id);
  saveLocalCache(userId, exists ? cached.map(t => (t.id === task.id ? task : t)) : [...cached, task]);
};

export const recordSync = () => {
  storage.save(SYNC_KEY, new Date().toISOString());
};

export const getLastSync = (): string | null => {
  return storage.load<string | null>(SYNC_KEY, null);
};

export const clearLastSync = () => {
  storage.remove(SYNC_KEY);
};
