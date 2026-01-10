import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useLanguage, useStore } from "@/lib/i18n";
import { CATEGORIES, STORE_LIST } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
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
  Gift,
  MapPin,
  ChevronDown,
  Heart,
  History,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRecentSearches } from "@/lib/storage";

const iconMap: Record<string, any> = {
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
  const { selectedStore, setStore } = useStore();
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
      <div className="bg-primary text-primary-foreground px-6 pb-8 pt-6 rounded-b-[2rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
        
        {/* Top bar with store and favorites */}
        <div className="relative z-10 flex justify-between items-center mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 h-9 gap-2 border border-white/20">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {language === 'en' ? selectedStore.nameEn : selectedStore.nameZh}
                </span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {STORE_LIST.map((store) => (
                <DropdownMenuItem 
                  key={store.id} 
                  onClick={() => setStore(store)}
                  className={selectedStore.id === store.id ? "bg-muted font-bold" : ""}
                >
                  {language === 'en' ? store.nameEn : store.nameZh}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/favorites">
            <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white rounded-full w-9 h-9 border border-white/20">
              <Heart className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center relative z-10">
          {language === 'en' ? 'Find products quickly' : '快速查找商品'}
        </h2>

        <form onSubmit={handleSearch} className="relative max-w-md mx-auto z-10 mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-10 py-6 rounded-full bg-background/95 dark:bg-secondary/50 dark:text-foreground text-foreground border-0 shadow-lg text-base placeholder:text-muted-foreground/70"
          />
        </form>

        {/* Recent Searches */}
        {recent.length > 0 && (
          <div className="relative z-10 flex flex-wrap gap-2 justify-center mt-2 max-h-20 overflow-hidden">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-white/60 mr-1 py-1">
              <Clock className="w-3 h-3" />
            </div>
            {recent.map((q, i) => (
              <Button
                key={i}
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
            ))}
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="flex-1 px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-foreground">{t("categories")}</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((cat, index) => {
            const Icon = iconMap[cat.icon] || Utensils;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto aspect-square flex flex-col items-center justify-center gap-2 border-border/60 bg-card dark:bg-secondary/20 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all shadow-sm group rounded-xl p-1"
                  onClick={() => setLocation(`/category/${cat.id}`)}
                >
                  <div className="p-2 rounded-full bg-muted dark:bg-secondary group-hover:bg-white dark:group-hover:bg-primary group-hover:shadow-md transition-all text-primary dark:text-primary-foreground">
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <span className="font-medium text-[10px] text-center leading-tight px-1 break-words w-full line-clamp-2 whitespace-normal text-foreground dark:text-foreground/90">
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
