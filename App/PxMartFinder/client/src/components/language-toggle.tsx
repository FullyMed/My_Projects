import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-muted rounded-full p-1 gap-1 border border-border/50 shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage("en")}
        className={cn(
          "rounded-full px-3 h-8 text-xs font-medium transition-all",
          language === "en" 
            ? "bg-white text-primary shadow-sm hover:bg-white hover:text-primary" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN 🇺🇸
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage("zh")}
        className={cn(
          "rounded-full px-3 h-8 text-xs font-medium transition-all",
          language === "zh" 
            ? "bg-white text-primary shadow-sm hover:bg-white hover:text-primary" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        中文 🇨🇳
      </Button>
    </div>
  );
}
