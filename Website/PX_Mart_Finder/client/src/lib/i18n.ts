import { createContext, useContext } from "react";
import { STORE_LIST, Store } from "./data";

export type Language = "en" | "zh";

export const translations = {
  en: {
    searchPlaceholder: "Search product name, brand, or category",
    categories: "Categories",
    results: "Results",
    location: "Location",
    aisle: "Aisle",
    shelf: "Shelf",
    section: "Section",
    similarProducts: "Similar Products",
    back: "Back",
    home: "Home",
    noResults: "No products found. Try a different search.",
    brand: "Brand",
    selectStore: "Select Store",
    locationNotAvailable: "Location not available for this store",
    favorites: "Favorites",
    recentSearches: "Recent Searches",
    noFavorites: "You haven't added any favorites yet.",
    didYouMean: "Did you mean:",
    tryOneOfThese: "Try one of these categories:",
    viewAisleMap: "View Aisle Map",
    storeMap: "Store Map",
    howToFind: "How to find this item",
    goToAisle: "Go to Aisle",
  },
  zh: {
    searchPlaceholder: "搜索产品名稱、品牌或類別",
    categories: "分類",
    results: "搜索結果",
    location: "位置",
    aisle: "走道",
    shelf: "貨架",
    section: "區域",
    similarProducts: "類似產品",
    back: "返回",
    home: "首頁",
    noResults: "未找到產品。請嘗試其他搜索。",
    brand: "品牌",
    selectStore: "選擇門店",
    locationNotAvailable: "該門店暫無位置信息",
    favorites: "我的收藏",
    recentSearches: "最近搜尋",
    noFavorites: "您尚未添加任何收藏。",
    didYouMean: "您是不是想找：",
    tryOneOfThese: "嘗試瀏覽這些類別：",
    viewAisleMap: "查看走道地圖",
    storeMap: "門店地圖",
    howToFind: "如何找到此商品",
    goToAisle: "前往走道",
  },
};

type StoreContextType = {
  selectedStore: Store;
  setStore: (store: Store) => void;
};

export const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
