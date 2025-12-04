import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { PRODUCTS, CATEGORIES } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, X } from "lucide-react";
import Fuse from "fuse.js";

export default function SearchResults() {
  const { t, language } = useLanguage();
  const [location, setLocation] = useLocation();
  
  // Parse query params manually since wouter doesn't give a hook for it
  const searchParams = new URLSearchParams(window.location.search);
  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("category");
  const subcategoryName = searchParams.get("subcategory");

  const [query, setQuery] = useState(q);

  // Update local state when URL changes
  useEffect(() => {
    setQuery(q);
  }, [q]);

  // Fuse.js setup
  const fuse = useMemo(() => {
    return new Fuse(PRODUCTS, {
      keys: [
        "product_name_en",
        "product_name_zh",
        "brand",
        "category_en",
        "category_zh",
        "sub_category_en",
        "sub_category_zh",
      ],
      threshold: 0.4, // Fuzzy match threshold
    });
  }, []);

  const results = useMemo(() => {
    let filtered = PRODUCTS;

    // Filter by Category if present
    if (categoryId) {
      const category = CATEGORIES.find(c => c.id === categoryId);
      if (category) {
        filtered = filtered.filter(p => 
          p.category_en === category.en || p.category_zh === category.zh // Checking by name match for simplicity based on data structure
        );
      }
    }

    // Filter by SubCategory if present
    if (subcategoryName) {
        filtered = filtered.filter(p => 
            p.sub_category_en === subcategoryName || p.sub_category_zh === subcategoryName
        );
    }

    // Filter by Search Query if present
    if (query) {
      const fuseResults = fuse.search(query);
      // If we have a category filter already, intersect the results
      if (categoryId || subcategoryName) {
         // Fuse returns { item, refIndex }
         const fuseIds = new Set(fuseResults.map(r => r.item.id));
         filtered = filtered.filter(p => fuseIds.has(p.id));
      } else {
        filtered = fuseResults.map(r => r.item);
      }
    }

    return filtered;
  }, [query, categoryId, subcategoryName, fuse]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Remove category filter when typing new search
    setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  const clearSearch = () => {
      setQuery("");
      setLocation("/search");
  };

  return (
    <div className="flex flex-col flex-1 bg-muted/30 min-h-screen">
      {/* Header Search Bar */}
      <div className="bg-white p-4 sticky top-[72px] z-40 shadow-sm border-b border-border/40">
         <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-9 pr-9 h-10 bg-muted/50 border-transparent focus:bg-white transition-all rounded-full"
            />
            {query && (
                <button 
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
         </form>
         
         {/* Active Filter Tag */}
         {(categoryId || subcategoryName) && (
             <div className="mt-3 flex flex-wrap items-center gap-2">
                 <span className="text-xs text-muted-foreground">{t("results")}:</span>
                 
                 {categoryId && (
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-6 text-xs rounded-full px-2 font-normal bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={() => setLocation("/search")}
                    >
                        {language === 'en' 
                            ? CATEGORIES.find(c => c.id === categoryId)?.en 
                            : CATEGORIES.find(c => c.id === categoryId)?.zh
                        }
                        <X className="w-3 h-3 ml-1" />
                    </Button>
                 )}

                 {subcategoryName && (
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-6 text-xs rounded-full px-2 font-normal bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={() => setLocation(`/search?category=${categoryId}`)}
                    >
                        {(() => {
                           const category = CATEGORIES.find(c => c.id === categoryId);
                           const sub = category?.subCategories.find(s => s.en === subcategoryName || s.zh === subcategoryName);
                           return sub ? (language === 'en' ? sub.en : sub.zh) : subcategoryName;
                        })()}
                        <X className="w-3 h-3 ml-1" />
                    </Button>
                 )}
             </div>
         )}
      </div>

      {/* Results List */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center px-1">
             <h2 className="font-semibold text-sm text-muted-foreground">
                {results.length} {t("results")}
             </h2>
        </div>

        {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <Search className="w-12 h-12 text-muted-foreground mb-4" />
                <p>{t("noResults")}</p>
            </div>
        ) : (
            results.map(product => (
                <ProductCard key={product.id} product={product} />
            ))
        )}
      </div>
    </div>
  );
}
