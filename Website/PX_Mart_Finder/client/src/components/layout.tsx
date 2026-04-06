import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STORE_LIST } from "@/lib/data";
import { useLanguage, useStore } from "@/lib/i18n";
import { ArrowLeft, ChevronDown, MapPin } from "lucide-react";
import { Link, useLocation } from "wouter";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";

export function Layout({ children }: { children: React.ReactNode }) {
  const { t, language } = useLanguage();
  const { selectedStore, setStore } = useStore();
  const [location] = useLocation();
  const isHome = location === '/';

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden border-x border-border/40 transition-colors duration-300">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50 shadow-md transition-colors duration-300">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1">
            {!isHome && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => window.history.back()}
                className="text-primary-foreground hover:bg-white/10 -ml-2 mr-1 rounded-full w-8 h-8"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden p-1">
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
                    {language === 'en' ? store.nameEn : store.nameZh}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}