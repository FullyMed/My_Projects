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
    locationNotAvailable: "Location data for this store is not available yet.",
    showSimilarWithLocation: "Show similar items with known locations",
    favorites: "Favorites",
    recentSearches: "Recent Searches",
    noFavorites: "You haven't added any favorites yet.",
    didYouMean: "Did you mean:",
    tryOneOfThese: "Try one of these categories:",
    viewAisleMap: "View Aisle Map",
    storeMap: "Store Map",
    howToFind: "How to find this item",
    goToAisle: "Go to Aisle",
    productNotFound: "Product not found",
    categoryNotFound: "Category not found",
    pageNotFound: "404 Page Not Found",
    pageNotFoundDesc: "This page does not exist.",
    demoAisleMap: "Demo Aisle Map (Placeholder)",
    goingToAisle: "You are going to Aisle",
    storeLayoutVisual: "Store Layout Visual",
    storeLayoutVisualization: "This is a visualization of the branch layout.",
    floorPlanDemo: "Floor Plan (Demo Placeholder)",
    storeLayoutView: "Store Layout View",
    availableSimilarItems: "Available Similar Items",
  },
  zh: {
    searchPlaceholder: "搜尋產品名稱、品牌或類別",
    categories: "分類",
    results: "搜尋結果",
    location: "位置",
    aisle: "走道",
    shelf: "貨架",
    section: "區域",
    similarProducts: "類似產品",
    back: "返回",
    home: "首頁",
    noResults: "找不到商品，請嘗試其他關鍵字。",
    brand: "品牌",
    selectStore: "選擇門市",
    locationNotAvailable: "此門市暫無位置資訊",
    showSimilarWithLocation: "顯示有位置資訊的相似商品",
    favorites: "我的收藏",
    recentSearches: "最近搜尋",
    noFavorites: "您尚未添加任何收藏。",
    didYouMean: "您是不是想找：",
    tryOneOfThese: "嘗試瀏覽這些類別：",
    viewAisleMap: "查看走道地圖",
    storeMap: "門市地圖",
    howToFind: "如何找到此商品",
    goToAisle: "前往走道",
    productNotFound: "找不到此商品",
    categoryNotFound: "找不到此分類",
    pageNotFound: "404 找不到頁面",
    pageNotFoundDesc: "此頁面不存在。",
    demoAisleMap: "示意走道地圖（佔位用）",
    goingToAisle: "前往走道",
    storeLayoutVisual: "門市佈局示意圖",
    storeLayoutVisualization: "此為門市空間佈局示意。",
    floorPlanDemo: "平面圖（示意）",
    storeLayoutView: "門市佈局視圖",
    availableSimilarItems: "有位置資訊的相似商品",
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
