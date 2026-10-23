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
      className="relative rounded-full shrink-0 bg-white/10 text-brand-foreground hover:bg-white/20 hover:text-brand-foreground focus-visible:ring-offset-brand"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform duration-200 ease-out dark:-rotate-90 dark:scale-0" aria-hidden="true" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform duration-200 ease-out dark:rotate-0 dark:scale-100" aria-hidden="true" />
      <span className="sr-only">{t("toggleTheme")}</span>
    </Button>
  );
}
