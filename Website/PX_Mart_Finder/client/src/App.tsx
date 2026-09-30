import { Switch, Route } from "wouter";
import { Layout } from "@/components/layout";
import { LanguageContext, translations, Language, StoreContext } from "@/lib/i18n";
import { FavoritesProvider } from "@/lib/favorites-provider";
import { readStored, writeStored } from "@/lib/storage";
import { lazy, Suspense, useState, useEffect } from "react";
import { STORE_LIST, Store } from "@/lib/data";
import { Loader2 } from "lucide-react";

// Home (the landing route) and NotFound stay in the main bundle; every other route
// is split out so Fuse.js etc. only load when those pages are visited.
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/theme-provider";

const SearchResults = lazy(() => import("@/pages/search-results"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const CategoryDetail = lazy(() => import("@/pages/category-detail"));
const Favorites = lazy(() => import("@/pages/favorites"));
const StoreMap = lazy(() => import("@/pages/store-map"));
const Terms = lazy(() => import("@/pages/terms"));
const Privacy = lazy(() => import("@/pages/privacy"));

function PageFallback() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Suspense fallback={<PageFallback />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/search" component={SearchResults} />
          <Route path="/category/:id" component={CategoryDetail} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/store-map" component={StoreMap} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>(() =>
    readStored("px-lang") === "zh" ? "zh" : "en"
  );
  const [selectedStore, setSelectedStore] = useState<Store>(() => {
    const saved = readStored("px-store");
    return STORE_LIST.find(s => s.id === saved) ?? STORE_LIST[0];
  });

  useEffect(() => {
    writeStored("px-lang", language);
    document.documentElement.lang = language === "zh" ? "zh-Hant-TW" : "en";
  }, [language]);

  useEffect(() => {
    writeStored("px-store", selectedStore.id);
  }, [selectedStore]);

  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations["en"][key];
  };

  const setStore = (store: Store) => setSelectedStore(store);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <LanguageContext.Provider value={{ language, setLanguage, t }}>
        <StoreContext.Provider value={{ selectedStore, setStore }}>
          <FavoritesProvider>
            <Router />
          </FavoritesProvider>
        </StoreContext.Provider>
      </LanguageContext.Provider>
    </ThemeProvider>
  );
}

export default App;
