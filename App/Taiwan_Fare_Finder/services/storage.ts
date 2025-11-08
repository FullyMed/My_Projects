import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteRoute, SearchHistoryItem, AppSettings, FareResult } from '@/types';

const KEYS = {
  FAVORITES: 'favorites',
  HISTORY: 'searchHistory',
  SETTINGS: 'appSettings',
  CACHED_RESULTS: 'cachedResults',
};

// Favorites
export const getFavorites = async (): Promise<FavoriteRoute[]> => {
  try {
    const favorites = await AsyncStorage.getItem(KEYS.FAVORITES);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const saveFavorite = async (favorite: FavoriteRoute): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const updatedFavorites = [...favorites.filter(f => f.id !== favorite.id), favorite];
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error saving favorite:', error);
  }
};

export const removeFavorite = async (favoriteId: string): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter(f => f.id !== favoriteId);
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
};

// Search History
export const getSearchHistory = async (): Promise<SearchHistoryItem[]> => {
  try {
    const history = await AsyncStorage.getItem(KEYS.HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

export const addToSearchHistory = async (item: SearchHistoryItem): Promise<void> => {
  try {
    const history = await getSearchHistory();
    const updatedHistory = [item, ...history.filter(h => h.id !== item.id)].slice(0, 50);
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error adding to search history:', error);
  }
};

export const clearSearchHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEYS.HISTORY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
};

// Settings
export const getSettings = async (): Promise<AppSettings> => {
  try {
    const settings = await AsyncStorage.getItem(KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : {
      language: 'en',
      currency: 'TWD',
      notifications: true,
      offlineMode: false,
      theme: 'auto',
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      language: 'en',
      currency: 'TWD',
      notifications: true,
      offlineMode: false,
      theme: 'auto',
    };
  }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

// Cached Results
export const getCachedResults = async (): Promise<FareResult[]> => {
  try {
    const results = await AsyncStorage.getItem(KEYS.CACHED_RESULTS);
    return results ? JSON.parse(results) : [];
  } catch (error) {
    console.error('Error getting cached results:', error);
    return [];
  }
};

export const cacheResult = async (result: FareResult): Promise<void> => {
  try {
    const cached = await getCachedResults();
    const updatedCache = [result, ...cached.filter(r => r.id !== result.id)].slice(0, 100);
    await AsyncStorage.setItem(KEYS.CACHED_RESULTS, JSON.stringify(updatedCache));
  } catch (error) {
    console.error('Error caching result:', error);
  }
};