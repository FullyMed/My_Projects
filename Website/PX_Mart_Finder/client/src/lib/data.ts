import productsJson from "../data/products.json";
import categoriesJson from "../data/categories.json";

export type Store = {
  id: string;
  nameEn: string;
  nameZh: string;
  aisleMapUrl?: string;
};

export const STORE_LIST: Store[] = [
  { 
    id: "px_wufeng_01", 
    nameEn: "PX Mart Wufeng (Taichung)", 
    nameZh: "全聯福利中心 霧峰門市（台中）",
    aisleMapUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
  },
  { 
    id: "demo_taipei_01", 
    nameEn: "Demo Store — Taipei", 
    nameZh: "示意門市 — 台北",
    aisleMapUrl: "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=2070&auto=format&fit=crop"
  },
  { 
    id: "demo_kaohsiung_01", 
    nameEn: "Demo Store — Kaohsiung", 
    nameZh: "示意門市 — 高雄",
    aisleMapUrl: "https://images.unsplash.com/photo-1601599561096-f87c95fff1e9?q=80&w=2070&auto=format&fit=crop"
  },
];

export type ProductLocation = {
  aisle: string;
  shelf: string;
  section_en: string;
  section_zh: string;
};

export type Product = {
  id: string;
  product_name_en: string;
  product_name_zh: string;
  brand: string;
  category_en: string;
  category_zh: string;
  sub_category_en: string;
  sub_category_zh: string;
  locationsByStore: Record<string, ProductLocation>;
  image_url: string;
  keywords: string[];
};

export const SYNONYMS: Record<string, string[]> = {
  "tissue": ["toilet paper", "napkin", "facial tissue", "衛生紙", "面紙", "紙巾"],
  "衛生紙": ["面紙", "紙巾", "tissue", "toilet paper"],
  "milk tea": ["latte", "tea with milk", "奶茶", "鮮奶茶"],
  "奶茶": ["鮮奶茶", "milk tea"],
  "soda": ["coke", "soft drink", "carbonated", "汽水", "可樂"],
  "汽水": ["可樂", "soda", "coke"],
  "noodles": ["ramen", "pasta", "instant noodles", "麵", "泡麵", "拉麵"],
  "麵": ["泡麵", "拉麵", "noodles"],
  "snacks": ["chips", "cookies", "crackers", "零食", "餅乾"],
  "零食": ["餅乾", "snacks"],
  "fruit": ["banana", "apple", "strawberry", "水果"],
  "水果": ["fruit"]
};

export type SubCategory = {
  en: string;
  zh: string;
}

export type Category = {
  id: string;
  en: string;
  zh: string;
  icon: string;
  subCategories: SubCategory[];
}

export const CATEGORIES: Category[] = categoriesJson as Category[];
export const PRODUCTS: Product[] = productsJson as Product[];
