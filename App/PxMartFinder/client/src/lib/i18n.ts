import { createContext, useContext } from "react";

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
  },
  zh: {
    searchPlaceholder: "搜索产品名称、品牌或类别",
    categories: "分类",
    results: "搜索结果",
    location: "位置",
    aisle: "走道",
    shelf: "货架",
    section: "区域",
    similarProducts: "类似产品",
    back: "返回",
    home: "首页",
    noResults: "未找到产品。请尝试其他搜索。",
    brand: "品牌",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => translations.en[key],
});

export const useLanguage = () => useContext(LanguageContext);
