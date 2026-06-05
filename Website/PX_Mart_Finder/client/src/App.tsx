import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { LanguageContext, translations, Language, StoreContext } from "@/lib/i18n";
import { FavoritesProvider } from "@/lib/favorites-provider";
import { useState, useEffect } from "react";
import { STORE_LIST, Store } from "@/lib/data";

import Home from "@/pages/home";
import SearchResults from "@/pages/search-results";
import ProductDetail from "@/pages/product-detail";
import CategoryDetail from "@/pages/category-detail";
import Favorites from "@/pages/favorites";
import StoreMap from "@/pages/store-map";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/theme-provider";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={SearchResults} />
        <Route path="/category/:id" component={CategoryDetail} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/store-map" component={StoreMap} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("px-lang") as Language) || "en");
  const [selectedStore, setSelectedStore] = useState<Store>(() => {
    const saved = localStorage.getItem("px-store");
    if (saved) {
      const found = STORE_LIST.find(s => s.id === saved);
      if (found) return found;
    }
    return STORE_LIST[0];
  });

  useEffect(() => {
    localStorage.setItem("px-lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("px-store", selectedStore.id);
  }, [selectedStore]);

  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations["en"][key];
  };

  const setStore = (store: Store) => setSelectedStore(store);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TooltipProvider>
          <LanguageContext.Provider value={{ language, setLanguage, t }}>
            <StoreContext.Provider value={{ selectedStore, setStore }}>
              <FavoritesProvider>
                <Toaster />
                <Router />
              </FavoritesProvider>
            </StoreContext.Provider>
          </LanguageContext.Provider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
