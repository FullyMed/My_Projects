import { Link, useLocation } from "wouter";
import { LanguageToggle } from "./language-toggle";
import { useLanguage } from "@/lib/i18n";
import { Search, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import generatedImage from '@assets/generated_images/modern_minimalist_supermarket_logo_icon_with_a_magnifying_glass_and_a_shopping_cart.png';

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [location] = useLocation();
  const isHome = location === '/';

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden border-x border-border/40">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50 shadow-md">
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
                   <img src={generatedImage} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="font-bold text-lg tracking-tight">PX Mart</h1>
              </div>
            </Link>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
