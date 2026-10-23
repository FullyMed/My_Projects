import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, countProducts } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import { useRecentSearches } from "@/lib/storage";
import { usePageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Apple,
  Armchair,
  Baby,
  Beef,
  Carrot,
  ChefHat,
  Clock,
  Coffee,
  Container,
  Cookie,
  Croissant,
  CupSoda,
  Dog,
  Egg,
  FlaskConical,
  Gift,
  ScrollText,
  Search,
  Shirt,
  Snowflake,
  Sparkles,
  SprayCan,
  Stethoscope,
  Utensils,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const iconMap: Record<string, LucideIcon> = {
  Cookie,
  CupSoda,
  Coffee,
  Croissant,
  Utensils,
  Beef,
  Apple,
  Carrot,
  Egg,
  Snowflake,
  FlaskConical,
  ScrollText,
  Container,
  SprayCan,
  Sparkles,
  Dog,
  ChefHat,
  UtensilsCrossed,
  Stethoscope,
  Baby,
  Armchair,
  Shirt,
  Gift
};

export default function Home() {
  const { t, language } = useLanguage();
  const { recent, addSearch } = useRecentSearches();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");

  usePageMeta(t("metaHomeTitle"), t("metaHomeDesc"));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      addSearch(trimmed);
      setLocation(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Hero / Search Section */}
      <div className="bg-brand text-brand-foreground px-6 lg:px-10 pb-8 lg:pb-10 pt-6 lg:pt-8 rounded-b-[2rem] lg:rounded-b-3xl shadow-lg relative overflow-hidden [--ring:0_0%_100%]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" aria-hidden="true"></div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10"
        >
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-center pt-2">
            {t("heroTitle")}
          </h1>

          <form onSubmit={handleSearch} className="relative max-w-md mx-auto mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" aria-hidden="true" />
            <Input
              type="search"
              aria-label={t("searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-11 h-12 rounded-full bg-background dark:bg-card text-foreground border-0 shadow-lg text-base md:text-base placeholder:text-muted-foreground"
            />
          </form>

          {/* Recent Searches */}
          {recent.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center items-center mt-3 max-h-[5.5rem] overflow-hidden">
              <span className="flex items-center text-brand-foreground/80 mr-0.5">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">{t("recentSearches")}</span>
              </span>
              {recent.map((q) => (
                <Button
                  key={q}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs rounded-full bg-white/10 hover:bg-white/20 text-brand-foreground hover:text-brand-foreground border border-white/15 focus-visible:ring-offset-brand"
                  onClick={() => {
                    setQuery(q);
                    setLocation(`/search?q=${encodeURIComponent(q)}`);
                  }}
                >
                  {q}
                </Button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Categories Section */}
      <div className="flex-1 px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-foreground">{t("categories")}</h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {CATEGORIES.map((cat, index) => {
            const Icon = iconMap[cat.icon] || Utensils;
            const count = countProducts(cat);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -3 }}
                transition={{
                  delay: Math.min(index, 8) * 0.04,
                  type: "spring",
                  stiffness: 280,
                  damping: 22,
                }}
              >
                <Button
                  variant="outline"
                  className="relative w-full h-auto aspect-square flex flex-col items-center justify-center gap-2 border-border/60 bg-card hover:bg-card hover:border-primary/30 hover:shadow-md shadow-sm group rounded-2xl p-2 whitespace-normal"
                  onClick={() => setLocation(`/category/${cat.id}`)}
                  aria-label={`${language === "en" ? cat.en : cat.zh} (${count} ${count === 1 ? t("itemCount") : t("itemsCount")})`}
                >
                  <span
                    className={cn(
                      "absolute top-1.5 right-1.5 min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold leading-5 text-center tabular-nums",
                      count > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}
                    aria-hidden="true"
                  >
                    {count}
                  </span>
                  <span className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-150 shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span className="font-medium text-xs text-center leading-tight px-0.5 break-words w-full line-clamp-2 whitespace-normal text-foreground">
                    {language === "en" ? cat.en : cat.zh}
                  </span>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-6 text-center border-t border-border/40 mt-4">
        <p className="text-xs text-muted-foreground mb-2 max-w-md mx-auto">{t("footerDisclaimer")}</p>
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <Link href="/terms" className="rounded px-1 py-1 hover:text-foreground transition-colors">
            {t("termsTitle")}
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/privacy" className="rounded px-1 py-1 hover:text-foreground transition-colors">
            {t("privacyTitle")}
          </Link>
        </div>
      </footer>
    </div>
  );
}