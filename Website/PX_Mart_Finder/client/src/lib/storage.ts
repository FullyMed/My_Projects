import { useState, useEffect, useContext, createContext } from "react";

export type FavoritesContextValue = {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
};

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);

// Corrupt/hand-edited localStorage (or storage blocked by the browser) must never crash the app.
export function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function readStoredList(key: string): string[] {
  try {
    const parsed: unknown = JSON.parse(readStored(key) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function writeStored(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage full or blocked — preferences just won't persist this session.
  }
}

export function useFavoritesState(): FavoritesContextValue {
  const [favorites, setFavorites] = useState<string[]>(() => readStoredList("px-favorites"));

  useEffect(() => {
    writeStored("px-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite };
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>(() => readStoredList("px-recent-searches"));

  useEffect(() => {
    writeStored("px-recent-searches", JSON.stringify(recent));
  }, [recent]);

  const addSearch = (query: string) => {
    if (!query.trim()) return;
    setRecent(prev => {
      const filtered = prev.filter(q => q !== query);
      return [query, ...filtered].slice(0, 10);
    });
  };

  const clearRecent = () => setRecent([]);

  return { recent, addSearch, clearRecent };
}
