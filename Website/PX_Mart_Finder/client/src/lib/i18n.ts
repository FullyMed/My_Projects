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
    pageNotFound: "Page Not Found",
    pageNotFoundDesc: "We couldn't find the page or product you're looking for. It may have been moved or doesn't exist.",
    searchProducts: "Search Products",
    backToHome: "Back to Home",
    goBack: "Go Back",
    metaHomeTitle: "Find Products Fast in Store",
    metaHomeDesc: "Search PX Mart Wufeng branch products and instantly find the aisle and shelf. A fast, bilingual product finder for Taiwan supermarkets.",
    metaSearchTitle: "Search Products",
    metaSearchDesc: "Browse and filter PX Mart products by name, brand, or category, with instant aisle and shelf locations.",
    metaFavoritesTitle: "Saved Products",
    metaFavoritesDesc: "Your saved PX Mart products, all in one place for quick access.",
    metaStoreMapTitle: "Store Map",
    metaStoreMapDesc: "View a demo aisle map of your selected PX Mart branch and find your way to any product.",
    demoAisleMap: "Demo Aisle Map (Placeholder)",
    goingToAisle: "You are going to Aisle",
    storeLayoutVisual: "Store Layout Visual",
    storeLayoutVisualization: "This is a visualization of the branch layout.",
    floorPlanDemo: "Floor Plan (Demo Placeholder)",
    storeLayoutView: "Store Layout View",
    availableSimilarItems: "Available Similar Items",
    legalLastUpdated: "Last updated: 2026",
    footerDisclaimer: "PX Mart Finder is an independent portfolio project, not affiliated with or endorsed by PX Mart (全聯福利中心).",
    termsTitle: "Terms of Use",
    termsIntro: "These Terms of Use govern your access to and use of PX Mart Finder (the \"App\"). By using the App, you agree to these terms. If you do not agree, please do not use the App.",
    termsSection1Title: "About This Prototype",
    termsSection1Body: "PX Mart Finder is an independent, unofficial portfolio and demonstration project. It is not affiliated with, endorsed by, or sponsored by PX Mart (全聯福利中心) or its parent company. Store names, branch information, product data, and aisle/shelf locations shown in the App are for demonstration purposes only and may not reflect real store layouts or inventory.",
    termsSection2Title: "Use of the App",
    termsSection2Body: "The App is provided for personal, non-commercial use, such as portfolio review, UX evaluation, or casual browsing. You agree not to misuse the App, attempt to disrupt its operation, or use it in any way that could damage or impair its functionality.",
    termsSection3Title: "No Warranty",
    termsSection3Body: "The App is provided \"as is\" and \"as available,\" without warranties of any kind, express or implied. We do not guarantee that product information, locations, or availability shown in the App are accurate, complete, or up to date.",
    termsSection4Title: "Limitation of Liability",
    termsSection4Body: "To the fullest extent permitted by law, the creator of this App is not liable for any damages or losses arising from your use of, or inability to use, the App, including reliance on any information it displays.",
    termsSection5Title: "Intellectual Property",
    termsSection5Body: "The PX Mart name and any related trademarks belong to their respective owners and are referenced here solely for demonstration purposes. Product images may be sourced from local assets or third-party stock photo providers (e.g. Unsplash) and are used for illustrative purposes only.",
    termsSection6Title: "Changes to These Terms",
    termsSection6Body: "These Terms may be updated from time to time as the App evolves. Continued use of the App after changes are posted constitutes acceptance of the revised Terms.",
    privacyTitle: "Privacy Policy",
    privacyIntro: "This Privacy Policy explains what information PX Mart Finder stores and how it is used. This is a portfolio/demo project with no backend server — nearly everything happens locally in your browser.",
    privacySection1Title: "Data Stored On Your Device",
    privacySection1Body: "The App uses your browser's local storage to remember your language preference, selected store branch, theme (light/dark), favorited products, and recent searches. This data stays on your device and is never transmitted to any server, because the App does not have one.",
    privacySection2Title: "No Accounts, No Tracking",
    privacySection2Body: "PX Mart Finder does not require account creation, does not use cookies for tracking, and does not run analytics or advertising scripts. We do not collect names, emails, locations, or any other personal information.",
    privacySection3Title: "Third-Party Content",
    privacySection3Body: "Some product images are loaded from Unsplash, a third-party image service, purely for illustrative purposes. Loading these images may send standard request information (such as your IP address) to Unsplash's servers, governed by Unsplash's own privacy policy.",
    privacySection4Title: "Managing Your Data",
    privacySection4Body: "You can clear all locally stored data at any time by clearing your browser's site data/cookies for this App, or by using your browser's private/incognito mode.",
    privacySection5Title: "Changes to This Policy",
    privacySection5Body: "This Privacy Policy may be updated as the App evolves. Any changes will be reflected on this page.",
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
    pageNotFound: "找不到頁面",
    pageNotFoundDesc: "找不到您要尋找的頁面或商品，可能已被移除或不存在。",
    searchProducts: "搜尋商品",
    backToHome: "回到首頁",
    goBack: "返回上一頁",
    metaHomeTitle: "快速查找商品",
    metaHomeDesc: "搜尋全聯霧峰門市商品，立即找到走道與貨架位置。快速雙語超市商品查找工具。",
    metaSearchTitle: "搜尋商品",
    metaSearchDesc: "依名稱、品牌或分類瀏覽並篩選全聯商品，即時顯示走道與貨架位置。",
    metaFavoritesTitle: "我的收藏",
    metaFavoritesDesc: "您收藏的全聯商品，方便隨時查看。",
    metaStoreMapTitle: "門市地圖",
    metaStoreMapDesc: "查看所選全聯門市的示意走道地圖，快速找到商品所在位置。",
    demoAisleMap: "示意走道地圖（佔位用）",
    goingToAisle: "前往走道",
    storeLayoutVisual: "門市佈局示意圖",
    storeLayoutVisualization: "此為門市空間佈局示意。",
    floorPlanDemo: "平面圖（示意）",
    storeLayoutView: "門市佈局視圖",
    availableSimilarItems: "有位置資訊的相似商品",
    legalLastUpdated: "最後更新：2026年",
    footerDisclaimer: "PX Mart Finder 為獨立製作的作品集專案，與全聯福利中心並無任何關聯或獲其認可。",
    termsTitle: "使用條款",
    termsIntro: "本使用條款規範您對 PX Mart Finder（以下稱「本應用程式」）的存取與使用。使用本應用程式即表示您同意本條款；若不同意，請勿使用本應用程式。",
    termsSection1Title: "關於本原型專案",
    termsSection1Body: "PX Mart Finder 為獨立製作的非官方作品集展示專案，與全聯福利中心或其母公司並無任何關聯、亦未獲其認可或贊助。應用程式中顯示的門市名稱、分店資訊、商品資料及走道貨架位置僅供展示用途，未必反映實際門市佈局或庫存狀況。",
    termsSection2Title: "使用規範",
    termsSection2Body: "本應用程式僅供個人非商業用途使用，例如作品集審閱、使用者體驗評估或一般瀏覽。您同意不得濫用本應用程式、嘗試干擾其運作，或以任何可能損害其功能的方式使用。",
    termsSection3Title: "不提供保證",
    termsSection3Body: "本應用程式以「現狀」及「現有」方式提供，不提供任何明示或默示的保證。我們不保證應用程式中顯示的商品資訊、位置或庫存狀態為準確、完整或最新。",
    termsSection4Title: "責任限制",
    termsSection4Body: "在法律允許的最大範圍內，本應用程式之創作者對於因使用或無法使用本應用程式（包括依賴其顯示之任何資訊）所產生的任何損害或損失，概不負責。",
    termsSection5Title: "智慧財產權",
    termsSection5Body: "「全聯」名稱及相關商標均屬其各自所有者所有，本專案僅為展示用途而引用。商品圖片可能取自本地素材或第三方圖庫（如 Unsplash），僅供示意用途。",
    termsSection6Title: "條款變更",
    termsSection6Body: "隨著應用程式的持續開發，本條款可能不定期更新。條款更新後如您持續使用本應用程式，即視為您接受修訂後的條款。",
    privacyTitle: "隱私權政策",
    privacyIntro: "本隱私權政策說明 PX Mart Finder 儲存哪些資訊及其使用方式。本專案為作品集展示用途，並無後端伺服器——幾乎所有資料都僅存在於您的瀏覽器本機。",
    privacySection1Title: "儲存於您裝置上的資料",
    privacySection1Body: "本應用程式使用瀏覽器的本機儲存空間，記錄您的語言偏好、選擇的門市分店、佈景主題（淺色/深色）、收藏商品及最近搜尋紀錄。這些資料僅保留在您的裝置上；由於本應用程式並無伺服器，因此不會被傳送至任何伺服器。",
    privacySection2Title: "無需帳號、不進行追蹤",
    privacySection2Body: "PX Mart Finder 不需要建立帳號，不使用追蹤型 Cookie，也未使用任何分析或廣告追蹤程式。我們不會收集姓名、電子郵件、位置或任何其他個人資訊。",
    privacySection3Title: "第三方內容",
    privacySection3Body: "部分商品圖片取自第三方圖庫服務 Unsplash，僅供示意用途。載入這些圖片時，可能會將標準請求資訊（如您的 IP 位址）傳送至 Unsplash 伺服器，並受 Unsplash 自身隱私權政策規範。",
    privacySection4Title: "管理您的資料",
    privacySection4Body: "您可隨時清除瀏覽器中此應用程式的網站資料/Cookie，或使用瀏覽器的無痕模式，以清除所有本機儲存的資料。",
    privacySection5Title: "政策變更",
    privacySection5Body: "隨著應用程式的持續開發，本隱私權政策可能不定期更新，任何變更將反映於本頁面。",
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
