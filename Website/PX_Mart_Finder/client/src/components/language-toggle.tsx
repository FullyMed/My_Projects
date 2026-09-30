import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center shrink-0 bg-muted rounded-full p-0.5 sm:p-1 gap-0.5 sm:gap-1 border border-border/50 shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage("en")}
        className={cn(
          "rounded-full px-2.5 sm:px-3 h-7 sm:h-8 text-xs font-medium transition-all",
          language === "en" 
            ? "bg-background text-foreground shadow-sm hover:bg-background hover:text-foreground dark:bg-primary dark:text-primary-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN<span className="hidden sm:inline" aria-hidden="true"> 🇺🇸</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage("zh")}
        className={cn(
          "rounded-full px-2.5 sm:px-3 h-7 sm:h-8 text-xs font-medium transition-all",
          language === "zh" 
            ? "bg-background text-foreground shadow-sm hover:bg-background hover:text-foreground dark:bg-primary dark:text-primary-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        繁中<span className="hidden sm:inline" aria-hidden="true"> 🇹🇼</span>
      </Button>
    </div>
  );
}
