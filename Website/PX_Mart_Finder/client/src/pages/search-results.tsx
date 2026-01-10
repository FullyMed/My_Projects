import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useLanguage, useStore } from "@/lib/i18n";
import { PRODUCTS, CATEGORIES, SYNONYMS } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  ArrowLeft, 
  X, 
  Filter, 
  ArrowUpDown,
  Tag,
  Map as MapIcon,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Fuse from "fuse.js";
import { useDebounce } from "use-debounce";
import { normalizeAisle } from "@/lib/normalize";

export default function SearchResults() {
  const { t, language } = useLanguage();
  const { selectedStore } = useStore();
  const [location, setLocation] = useLocation();
  
  const searchParams = new URLSearchParams(window.location.search);
  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("category");
  const subcategoryName = searchParams.get("subcategory");

  const [query, setQuery] = useState(q);
  const [debouncedQuery] = useDebounce(query, 300);
  const brandFilter = searchParams.get("brand");
  const sortBy = searchParams.get("sort") || "relevance";

  useEffect(() => {
    setQuery(q);
  }, [q]);

  useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search);
    if (debouncedQuery !== (currentParams.get("q") || "")) {
      const params = new URLSearchParams(window.location.search);
      if (debouncedQuery) params.set("q", debouncedQuery);
      else params.delete("q");
      setLocation(`/search?${params.toString()}`, { replace: true });
    }
  }, [debouncedQuery, setLocation]);

  const expandedTerms = useMemo(() => {
    if (!q) return [];
    const term = q.toLowerCase().trim();
    const synonyms = SYNONYMS[term] || [];
    return [q, ...synonyms];
  }, [q]);

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
        "keywords"
      ],
      threshold: 0.3,
    });
  }, []);

  const results = useMemo(() => {
    let filtered = PRODUCTS;

    if (categoryId) {
      const category = CATEGORIES.find(c => c.id === categoryId);
      if (category) {
        filtered = filtered.filter(p => 
          p.category_en === category.en || p.category_zh === category.zh
        );
      }
    }

    if (subcategoryName) {
        filtered = filtered.filter(p => 
            p.sub_category_en === subcategoryName || p.sub_category_zh === subcategoryName
        );
    }

    if (q) {
      const allResults = new Map();
      
      expandedTerms.forEach(term => {
        fuse.search(term).forEach(res => {
          if (!allResults.has(res.item.id)) {
            allResults.set(res.item.id, res.item);
          }
        });
      });

      const fuseIds = new Set(allResults.keys());
      if (categoryId || subcategoryName) {
         filtered = filtered.filter(p => fuseIds.has(p.id));
      } else {
        filtered = Array.from(allResults.values());
      }
    }

    if (brandFilter) {
      filtered = filtered.filter(p => p.brand === brandFilter);
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        const nameA = language === 'en' ? a.product_name_en : a.product_name_zh;
        const nameB = language === 'en' ? b.product_name_en : b.product_name_zh;
        return nameA.localeCompare(nameB, language === 'zh' ? 'zh-Hans' : 'en');
      }
      if (sortBy === "aisle") {
        const locA = a.locationsByStore[selectedStore.id];
        const locB = b.locationsByStore[selectedStore.id];
        
        const aisleA = locA ? normalizeAisle(locA.aisle) : null;
        const aisleB = locB ? normalizeAisle(locB.aisle) : null;
        
        if (aisleA === null && aisleB === null) {
          const nameA = language === 'en' ? a.product_name_en : a.product_name_zh;
          const nameB = language === 'en' ? b.product_name_en : b.product_name_zh;
          return nameA.localeCompare(nameB, language === 'zh' ? 'zh-Hans' : 'en');
        }
        if (aisleA === null) return 1;
        if (aisleB === null) return -1;
        
        if (aisleA !== aisleB) return aisleA - aisleB;
        
        const shelfA = locA ? normalizeAisle(locA.shelf) : null;
        const shelfB = locB ? normalizeAisle(locB.shelf) : null;
        
        if (shelfA === null && shelfB === null) return 0;
        if (shelfA === null) return 1;
        if (shelfB === null) return -1;
        return shelfA - shelfB;
      }
      return 0;
    });

    return sorted;
  }, [q, expandedTerms, categoryId, subcategoryName, brandFilter, sortBy, fuse, language, selectedStore.id]);

  const uniqueBrands = useMemo(() => {
    let baseResults = PRODUCTS;
    if (categoryId) {
      const cat = CATEGORIES.find(c => c.id === categoryId);
      if (cat) baseResults = baseResults.filter(p => p.category_en === cat.en || p.category_zh === cat.zh);
    }
    if (subcategoryName) {
      baseResults = baseResults.filter(p => p.sub_category_en === subcategoryName || p.sub_category_zh === subcategoryName);
    }
    if (q) {
      const allRes = new Map();
      expandedTerms.forEach(term => fuse.search(term).forEach(res => allRes.set(res.item.id, res.item)));
      const fuseIds = new Set(allRes.keys());
      baseResults = baseResults.filter(p => fuseIds.has(p.id));
    }
    return Array.from(new Set(baseResults.map(p => p.brand))).sort();
  }, [q, expandedTerms, categoryId, subcategoryName, fuse]);

  const suggestions = useMemo(() => {
    if (!q || results.length > 0) return [];
    
    const nameFuse = new Fuse(PRODUCTS, {
      keys: ["product_name_en", "product_name_zh"],
      threshold: 0.5,
    });
    
    const matches = nameFuse.search(q);
    const uniqueMatches = new Set<string>();
    const items: { name: string, id: string }[] = [];
    
    for (const match of matches) {
      const name = language === 'en' ? match.item.product_name_en : match.item.product_name_zh;
      if (!uniqueMatches.has(name)) {
        uniqueMatches.add(name);
        items.push({ name, id: match.item.id });
      }
      if (items.length >= 5) break;
    }
    
    return items;
  }, [q, results.length, language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    params.set("q", query);
    setLocation(`/search?${params.toString()}`);
  };

  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    setLocation(`/search?${params.toString()}`);
  }, [setLocation]);

  const clearSearch = () => {
      setQuery("");
      setLocation("/search");
  };

  return (
    <div className="flex flex-col flex-1 bg-muted/30 min-h-screen">
      <div className="bg-white dark:bg-card p-4 sticky top-[72px] z-40 shadow-sm border-b border-border/40 transition-colors">
         <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-9 pr-9 h-10 bg-muted/50 border-transparent focus:bg-white dark:focus:bg-secondary transition-all rounded-full"
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
         
         {expandedTerms.length > 1 && (
           <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
             <span className="text-[10px] uppercase font-bold text-muted-foreground shrink-0">
               {language === 'en' ? 'Including' : '包含'}:
             </span>
             {expandedTerms.slice(1).map((term, i) => (
               <Badge key={i} variant="outline" className="text-[10px] py-0 px-2 h-5 bg-muted/30 whitespace-nowrap">
                 {term}
               </Badge>
             ))}
           </div>
         )}

         {(categoryId || subcategoryName) && (
             <div className="mt-3 flex flex-wrap items-center gap-2">
                 <span className="text-xs text-muted-foreground">{t("results")}:</span>
                 
                 {categoryId && (
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-6 text-xs rounded-full px-2 font-normal bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={() => updateParam("category", null)}
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
                        onClick={() => updateParam("subcategory", null)}
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

         <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <Select value={brandFilter || "all"} onValueChange={(val) => updateParam("brand", val === "all" ? null : val)}>
              <SelectTrigger className="h-8 text-xs w-auto min-w-[100px] rounded-full bg-muted/50 border-transparent">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue placeholder={language === 'en' ? 'Brand' : '品牌'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'en' ? 'All Brands' : '所有品牌'}</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(val) => updateParam("sort", val)}>
              <SelectTrigger className="h-8 text-xs w-auto min-w-[100px] rounded-full bg-muted/50 border-transparent">
                <ArrowUpDown className="w-3 h-3 mr-1" />
                <SelectValue placeholder={language === 'en' ? 'Sort By' : '排序'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">{language === 'en' ? 'Relevance' : '相關性'}</SelectItem>
                <SelectItem value="name">{language === 'en' ? 'Name A-Z' : '名稱 A-Z'}</SelectItem>
                <SelectItem value="aisle">{language === 'en' ? 'Aisle Order' : '走道順序'}</SelectItem>
              </SelectContent>
            </Select>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {results.length > 0 ? (
          <>
            <div className="flex justify-between items-center px-1">
                 <h2 className="font-semibold text-sm text-muted-foreground">
                    {results.length} {t("results")}
                 </h2>
            </div>
            
            <div className="space-y-3">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="py-12 px-4 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground/40" />
             </div>
             <h3 className="text-lg font-bold text-foreground mb-2">{t("noResults")}</h3>
             
             {suggestions.length > 0 && (
               <div className="mt-8 w-full max-w-sm">
                 <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {t("didYouMean")}
                 </p>
                 <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((s, i) => (
                      <Button 
                        key={i} 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full text-xs hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                        onClick={() => {
                          setQuery(s.name);
                          updateParam("q", s.name);
                        }}
                      >
                        {s.name}
                      </Button>
                    ))}
                 </div>
               </div>
             )}

             <div className="mt-10 w-full max-w-sm">
               <p className="text-sm font-medium text-muted-foreground mb-4">
                  {t("tryOneOfThese")}
               </p>
               <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.slice(0, 4).map(cat => (
                    <Button
                      key={cat.id}
                      variant="ghost"
                      className="justify-start h-auto py-3 px-4 bg-muted/50 hover:bg-primary/5 hover:text-primary rounded-2xl border border-transparent hover:border-primary/20 transition-all"
                      onClick={() => setLocation(`/category/${cat.id}`)}
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-bold truncate w-full">
                          {language === 'en' ? cat.en : cat.zh}
                        </span>
                        <span className="text-[10px] opacity-60">
                          {cat.subCategories.length} items
                        </span>
                      </div>
                    </Button>
                  ))}
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
