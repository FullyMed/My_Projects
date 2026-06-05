import { FavoritesContext, useFavoritesState } from "@/lib/storage";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const value = useFavoritesState();
  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
