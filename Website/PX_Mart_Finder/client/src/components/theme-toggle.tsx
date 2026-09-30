import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const { t } = useLanguage();

  // Toggle from what's actually on screen: in "system" mode the stored theme says
  // neither light nor dark, so comparing against it would make the first click a no-op.
  const toggle = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="rounded-full w-8 h-8 shrink-0 bg-white/10 hover:bg-white/20 text-primary-foreground border border-transparent"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">{t("toggleTheme")}</span>
    </Button>
  );
}
