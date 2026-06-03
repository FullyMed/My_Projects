import { supabase } from '../utils/supabaseClient';
import { CalendarEvent } from '../types';
import { storage } from '../utils/storage';
import { recordSync } from './plannerApi';

export const getEvents = async (userId: string): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('date_iso', { ascending: true });

    if (error) throw error;

    const events = (data || []).map(e => ({
      id: e.id,
      dateISO: e.date_iso,
      time: e.time,
      title: e.title,
      description: e.description,
      category: e.category,
      createdAt: e.created_at,
      updatedAt: e.updated_at
    }));

    updateLocalCache(userId, events);
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
        time: event.time,
        title: event.title,
        description: event.description,
        category: event.category
      })
      .select()
      .single();

    if (error) throw error;

    const newEvent = {
      id: data.id,
      dateISO: data.date_iso,
      time: data.time,
      title: data.title,
      description: data.description,
      category: data.category,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    recordSync();
    return newEvent;
  } catch (err) {
    console.error('Error creating event:', err);
    return null;
  }
};

export const updateEvent = async (userId: string, eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
  try {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category) updateData.category = updates.category;

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    const updated = {
      id: data.id,
      dateISO: data.date_iso,
      time: data.time,
      title: data.title,
      description: data.description,
      category: data.category,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

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

    recordSync();
    return true;
  } catch (err) {
    console.error('Error deleting event:', err);
    return false;
  }
};

const updateLocalCache = (userId: string, events: CalendarEvent[]) => {
  const key = storage.getUserKey('events', userId);
  storage.save(key, events);
};

const getLocalCache = (userId: string): CalendarEvent[] => {
  const key = storage.getUserKey('events', userId);
  return storage.load(key, []);
};
