import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STORE_LIST } from "@/lib/data";
import { useLanguage, useStore } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, ChevronDown, Heart, Home as HomeIcon, MapPin, Search } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS = [
  { href: "/", Icon: HomeIcon, labelKey: "home" },
  { href: "/search", Icon: Search, labelKey: "navSearch" },
  { href: "/favorites", Icon: Heart, labelKey: "navSaved" },
] as const;

function isNavActive(href: string, location: string) {
  return href === "/" ? location === "/" : location.startsWith(href);
}

function Sidebar() {
  const [location] = useLocation();
  const { t } = useLanguage();

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border/40 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto bg-background">
      <nav className="p-3 pt-6 space-y-1">
        {NAV_ITEMS.map(({ href, Icon, labelKey }) => {
          const active = isNavActive(href, location);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150",
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 shrink-0",
                href === "/favorites" && active && "fill-current"
              )} />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-3 pb-6 space-y-1 text-xs text-muted-foreground">
        <Link href="/terms" className="block rounded-md px-3 py-1.5 hover:text-foreground transition-colors">
          {t("termsTitle")}
        </Link>
        <Link href="/privacy" className="block rounded-md px-3 py-1.5 hover:text-foreground transition-colors">
          {t("privacyTitle")}
        </Link>
      </div>
    </aside>
  );
}

function BottomNav() {
  const [location] = useLocation();
  const { t } = useLanguage();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/40 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
      <div className="flex h-16">
        {NAV_ITEMS.map(({ href, Icon, labelKey }) => {
          const active = isNavActive(href, location);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors duration-150 -outline-offset-4",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary" />
              )}
              <Icon className={cn(
                "w-[22px] h-[22px]",
                href === "/favorites" && active && "fill-current"
              )} />
              <span className={cn("text-xs", active ? "font-semibold" : "font-medium")}>
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { language, t } = useLanguage();
  const { selectedStore, setStore } = useStore();
  const [location] = useLocation();
  const isHome = location === "/";

  // SPA navigation keeps the previous page's scroll offset; start each new page at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-card focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg"
      >
        {t("skipToContent")}
      </a>

      {/* Header: full viewport width, content capped at screen-xl. --ring is white here so
          focus rings show against the blue. */}
      <header className="bg-brand text-brand-foreground sticky top-0 z-50 shadow-md [--ring:0_0%_100%]">
        <div className="max-w-screen-xl mx-auto px-4 h-[72px] flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1 shrink-0">
            {!isHome && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                aria-label={t("back")}
                className="text-brand-foreground hover:bg-white/10 hover:text-brand-foreground focus-visible:ring-offset-brand -ml-2.5 rounded-full shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <Link href="/" className="flex items-center gap-2 rounded-full">
              <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center overflow-hidden p-1 shrink-0">
                <img src="/Images/Logo.png" alt="" className="w-full h-full object-contain" />
              </span>
              {/* Text title only fits beside the store picker + toggles from ~420px up; the logo carries it below that.
                  Not an <h1>: each page has its own. */}
              <span className="sr-only min-[420px]:not-sr-only font-bold text-lg tracking-tight">PX Mart</span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label={`${t("selectStore")}: ${language === "en" ? selectedStore.nameEn : selectedStore.nameZh}`}
                  className="relative flex items-center min-w-0 h-8 px-2.5 rounded-full bg-white/10 border border-white/25 text-xs font-medium max-w-[9rem] transition-[background-color,transform] duration-150 ease-out hover:bg-white/20 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-y-1.5 after:inset-x-0"
                >
                  <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" aria-hidden="true" />
                  <span className="truncate mr-1">
                    {language === "en" ? selectedStore.nameEn : selectedStore.nameZh}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70 shrink-0" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                {STORE_LIST.map((store) => {
                  const selected = selectedStore.id === store.id;
                  return (
                    <DropdownMenuItem
                      key={store.id}
                      onClick={() => setStore(store)}
                      className={cn("min-h-10 justify-between", selected && "font-semibold")}
                    >
                      {language === "en" ? store.nameEn : store.nameZh}
                      {selected && <Check className="text-primary" aria-hidden="true" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Body: sidebar (desktop) + main content */}
      <div className="flex flex-1 max-w-screen-xl mx-auto w-full">
        <Sidebar />
        <main id="main" tabIndex={-1} className="flex-1 min-w-0 flex flex-col pb-16 lg:pb-0 focus:outline-none">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
