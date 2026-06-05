import { useState, useEffect, useContext, createContext } from "react";

export type FavoritesContextValue = {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
};

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function useFavoritesState(): FavoritesContextValue {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("px-favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("px-favorites", JSON.stringify(favorites));
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
  const [recent, setRecent] = useState<string[]>(() => {
    const saved = localStorage.getItem("px-recent-searches");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("px-recent-searches", JSON.stringify(recent));
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
