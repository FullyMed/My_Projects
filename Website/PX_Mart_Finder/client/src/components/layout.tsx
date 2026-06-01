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
import { ArrowLeft, ChevronDown, Heart, Home as HomeIcon, MapPin, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS = [
  { href: "/", Icon: HomeIcon, en: "Home", zh: "首頁" },
  { href: "/search", Icon: Search, en: "Search", zh: "搜尋" },
  { href: "/favorites", Icon: Heart, en: "Saved", zh: "收藏" },
] as const;

function isNavActive(href: string, location: string) {
  return href === "/" ? location === "/" : location.startsWith(href);
}

function Sidebar() {
  const [location] = useLocation();
  const { language } = useLanguage();

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border/40 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto bg-background">
      <nav className="p-3 pt-6 space-y-1">
        {NAV_ITEMS.map(({ href, Icon, en, zh }) => {
          const active = isNavActive(href, location);
          return (
            <Link key={href} href={href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer",
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
              )}>
                <Icon className={cn(
                  "w-5 h-5 shrink-0",
                  href === "/favorites" && active && "fill-current"
                )} />
                <span>{language === "en" ? en : zh}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function BottomNav() {
  const [location] = useLocation();
  const { language } = useLanguage();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/40 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
      <div className="flex h-16">
        {NAV_ITEMS.map(({ href, Icon, en, zh }) => {
          const active = isNavActive(href, location);
          return (
            <Link key={href} href={href} className="flex-1">
              <div className={cn(
                "relative flex flex-col items-center justify-center h-full gap-0.5 transition-colors duration-200",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary" />
                )}
                <Icon className={cn(
                  "w-[22px] h-[22px] transition-transform duration-200",
                  active ? "scale-110" : "scale-100",
                  href === "/favorites" && active && "fill-current"
                )} />
                <span className={cn("text-[10px]", active ? "font-bold" : "font-medium")}>
                  {language === "en" ? en : zh}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const { selectedStore, setStore } = useStore();
  const [location] = useLocation();
  const isHome = location === "/";

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      {/* Header — full viewport width, content capped at screen-xl */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md transition-colors duration-300">
        <div className="max-w-screen-xl mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 shrink-0">
            {!isHome && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                className="text-primary-foreground hover:bg-white/10 -ml-2 mr-1 rounded-full w-8 h-8 shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden p-1 shrink-0">
                  <img src="/Images/Logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="font-bold text-lg tracking-tight">PX Mart</h1>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center px-2 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-semibold max-w-[8rem] transition-colors hover:bg-white/20 outline-none">
                  <MapPin className="w-3 h-3 mr-1 opacity-80 shrink-0" />
                  <span className="truncate mr-1">
                    {language === "en" ? selectedStore.nameEn : selectedStore.nameZh}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {STORE_LIST.map((store) => (
                  <DropdownMenuItem
                    key={store.id}
                    onClick={() => setStore(store)}
                    className={selectedStore.id === store.id ? "bg-muted font-bold" : ""}
                  >
                    {language === "en" ? store.nameEn : store.nameZh}
                  </DropdownMenuItem>
                ))}
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
        <main className="flex-1 min-w-0 flex flex-col pb-16 lg:pb-0">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
