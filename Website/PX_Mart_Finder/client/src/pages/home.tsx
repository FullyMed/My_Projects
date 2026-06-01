import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import { useRecentSearches } from "@/lib/storage";
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
import { useLocation } from "wouter";

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addSearch(query.trim());
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Hero / Search Section */}
      <div className="bg-primary text-primary-foreground px-6 lg:px-10 pb-8 lg:pb-10 pt-6 lg:pt-8 rounded-b-[2rem] lg:rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10"
        >
          <h2 className="text-2xl font-bold mb-6 text-center pt-2">
            {language === 'en' ? 'Find products quickly' : '快速查找商品'}
          </h2>

          <form onSubmit={handleSearch} className="relative max-w-md mx-auto mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-10 py-6 rounded-full bg-background/95 dark:bg-secondary/50 dark:text-foreground text-foreground border-0 shadow-lg text-base placeholder:text-muted-foreground/70 focus:ring-4 focus:ring-white/20 transition-shadow duration-200"
            />
          </form>

          {/* Recent Searches */}
          {recent.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-2 max-h-20 overflow-hidden">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-white/60 mr-1 py-1">
                <Clock className="w-3 h-3" />
              </div>
              {recent.map((q, i) => (
                <motion.div
                  key={i}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    onClick={() => {
                      setQuery(q);
                      setLocation(`/search?q=${encodeURIComponent(q)}`);
                    }}
                  >
                    {q}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Categories Section */}
      <div className="flex-1 px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-foreground">{t("categories")}</h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {CATEGORIES.map((cat, index) => {
            const Icon = iconMap[cat.icon] || Utensils;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.93 }}
                transition={{
                  delay: index * 0.03,
                  type: "spring",
                  stiffness: 280,
                  damping: 22,
                }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto aspect-square flex flex-col items-center justify-center gap-2 border-border/50 bg-card dark:bg-secondary/20 hover:bg-primary/5 hover:border-primary/20 hover:shadow-md transition-colors duration-200 shadow-sm group rounded-2xl p-2"
                  onClick={() => setLocation(`/category/${cat.id}`)}
                >
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 shadow-sm shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <span className="font-semibold text-[11px] text-center leading-tight px-0.5 break-words w-full line-clamp-2 whitespace-normal text-foreground/90 dark:text-foreground/90">
                    {language === "en" ? cat.en : cat.zh}
                  </span>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}