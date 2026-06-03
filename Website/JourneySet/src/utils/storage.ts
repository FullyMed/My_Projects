type StorageKey =
  | 'journeyset:v1:planner'
  | 'journeyset:v1:goals'
  | 'journeyset:v1:events'
  | 'journeyset:v1:user'
  | 'journeyset:v1:users'
  | 'journeyset:v1:theme'
  | 'journeyset:v1:lastQuoteDate';

export const storage = {
  load<T>(key: StorageKey, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return fallback;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error);
      return fallback;
    }
  },

  save<T>(key: StorageKey, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  },

  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  },

  clearAll(): void {
    try {
      const keys: StorageKey[] = [
        'journeyset:v1:planner',
        'journeyset:v1:goals',
        'journeyset:v1:events',
        'journeyset:v1:user',
        'journeyset:v1:users',
        'journeyset:v1:theme',
        'journeyset:v1:lastQuoteDate'
      ];
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  getUserKey(baseKey: 'planner' | 'goals' | 'events', userId: string): StorageKey {
    return `journeyset:v1:${baseKey}:${userId}` as StorageKey;
  }
};
