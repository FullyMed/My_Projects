import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/data";
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
  Gift 
} from "lucide-react";
import { motion } from "framer-motion";

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
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Hero / Search Section */}
      <div className="bg-primary text-primary-foreground px-6 pb-10 pt-6 rounded-b-[2rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
        
        <h2 className="text-2xl font-bold mb-6 text-center relative z-10">
          {language === 'en' ? 'Find products quickly' : '快速查找商品'}
        </h2>

        <form onSubmit={handleSearch} className="relative max-w-md mx-auto z-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-10 py-6 rounded-full bg-background/95 dark:bg-secondary/50 dark:text-foreground text-foreground border-0 shadow-lg text-base placeholder:text-muted-foreground/70"
          />
        </form>
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
