import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { LanguageContext, translations, Language } from "@/lib/i18n";
import { useState } from "react";

import Home from "@/pages/home";
import SearchResults from "@/pages/search-results";
import ProductDetail from "@/pages/product-detail";
import CategoryDetail from "@/pages/category-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={SearchResults} />
        <Route path="/category/:id" component={CategoryDetail} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

import { ThemeProvider } from "@/components/theme-provider";

function App() {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: keyof typeof translations.en) => {
    return translations[language][key];
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TooltipProvider>
          <LanguageContext.Provider value={{ language, setLanguage, t }}>
            <Toaster />
            <Router />
          </LanguageContext.Provider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
