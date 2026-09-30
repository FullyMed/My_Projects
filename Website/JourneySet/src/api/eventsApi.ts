import { supabase } from '../utils/supabaseClient';
import { CalendarEvent } from '../types';
import { storage } from '../utils/storage';
import { recordSync } from './plannerApi';

interface EventRow {
  id: string;
  date_iso: string;
  time: string | null;
  title: string;
  description: string | null;
  category: CalendarEvent['category'] | null;
  created_at: string;
  updated_at: string;
}

const toEvent = (row: EventRow): CalendarEvent => ({
  id: row.id,
  dateISO: row.date_iso,
  time: row.time ?? undefined,
  title: row.title,
  description: row.description ?? undefined,
  category: row.category ?? 'other',
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const getEvents = async (userId: string): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('date_iso', { ascending: true });

    if (error) throw error;

    const events = (data || []).map(toEvent);
    saveLocalCache(userId, events);
    return events;
  } catch (err) {
    console.error('Error fetching events:', err);
    return getLocalCache(userId);
  }
};

export const createEvent = async (userId: string, event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert({
        user_id: userId,
        date_iso: event.dateISO,
        time: event.time || null,
        title: event.title,
        description: event.description || null,
        category: event.category
      })
      .select()
      .single();

    if (error) throw error;

    const newEvent = toEvent(data);
    saveLocalCache(userId, [...getLocalCache(userId), newEvent]);
    recordSync();
    return newEvent;
  } catch (err) {
    console.error('Error creating event:', err);
    return null;
  }
};

/**
 * `time` and `description` are only touched when their key is present in
 * `updates`; an empty value clears them.
 */
export const updateEvent = async (userId: string, eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
  try {
    const updateData: { title?: string; date_iso?: string; time?: string | null; description?: string | null; category?: string } = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.dateISO !== undefined) updateData.date_iso = updates.dateISO;
    if ('time' in updates) updateData.time = updates.time || null;
    if ('description' in updates) updateData.description = updates.description || null;
    if (updates.category !== undefined) updateData.category = updates.category;

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    const updated = toEvent(data);
    saveLocalCache(userId, getLocalCache(userId).map(e => (e.id === eventId ? updated : e)));
    recordSync();
    return updated;
  } catch (err) {
    console.error('Error updating event:', err);
    return null;
  }
};

export const deleteEvent = async (userId: string, eventId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', userId);

    if (error) throw error;

    saveLocalCache(userId, getLocalCache(userId).filter(e => e.id !== eventId));
    recordSync();
    return true;
  } catch (err) {
    console.error('Error deleting event:', err);
    return false;
  }
};

const saveLocalCache = (userId: string, events: CalendarEvent[]) => {
  storage.save(storage.getUserKey('events', userId), events);
};

const getLocalCache = (userId: string): CalendarEvent[] => {
  const cached = storage.load<CalendarEvent[]>(storage.getUserKey('events', userId), []);
  return Array.isArray(cached) ? cached : [];
};
