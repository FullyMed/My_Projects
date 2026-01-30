import { useState, useEffect } from "react";

export function useFavorites() {
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
