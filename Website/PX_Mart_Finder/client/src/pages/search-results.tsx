import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, PRODUCTS, SYNONYMS, countProducts, isInCategory, isInSubCategory } from "@/lib/data";
import type { Product } from "@/lib/data";
import { useLanguage, useStore } from "@/lib/i18n";
import { normalizeAisle } from "@/lib/normalize";
import { usePageMeta } from "@/lib/seo";
import { useRecentSearches } from "@/lib/storage";
import Fuse from "fuse.js";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  Filter,
  Loader2,
  PackageOpen,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { useLocation, useSearch } from "wouter";


export default function SearchResults() {
  const { t, language } = useLanguage();
  const { selectedStore } = useStore();
  const { addSearch } = useRecentSearches();
  const [, setLocation] = useLocation();

  // useSearch (not window.location.search) so query-string-only navigations
  // like changing sort/brand re-render; wouter's useLocation only tracks the pathname.
  const search = useSearch();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
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
        "keywords",
      ],
      threshold: 0.3,
    });
  }, []);

  const results = useMemo(() => {
    let filtered: Product[] = PRODUCTS;

    if (categoryId) {
      const category = CATEGORIES.find((c) => c.id === categoryId);
      if (category) {
        filtered = filtered.filter((p) => isInCategory(p, category));
      }
    }

    if (subcategoryName) {
      filtered = filtered.filter((p) => isInSubCategory(p, subcategoryName));
    }

    if (q) {
      const allResults = new Map<string, Product>();

      expandedTerms.forEach((term) => {
        fuse.search(term).forEach((res) => {
          if (!allResults.has(res.item.id)) {
            allResults.set(res.item.id, res.item);
          }
        });
      });

      const fuseIds = new Set(allResults.keys());

      if (categoryId || subcategoryName) {
        filtered = filtered.filter((p) => fuseIds.has(p.id));
      } else {
        filtered = Array.from(allResults.values());
      }
    }

    if (brandFilter) {
      filtered = filtered.filter((p) => p.brand === brandFilter);
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        const nameA = language === "en" ? a.product_name_en : a.product_name_zh;
        const nameB = language === "en" ? b.product_name_en : b.product_name_zh;
        return nameA.localeCompare(nameB, language === "zh" ? "zh-Hant" : "en");
      }

      if (sortBy === "aisle") {
        const locA = a.locationsByStore[selectedStore.id];
        const locB = b.locationsByStore[selectedStore.id];

        const aisleA = locA ? normalizeAisle(locA.aisle) : null;
        const aisleB = locB ? normalizeAisle(locB.aisle) : null;

        if (aisleA === null && aisleB === null) {
          const nameA =
            language === "en" ? a.product_name_en : a.product_name_zh;
          const nameB =
            language === "en" ? b.product_name_en : b.product_name_zh;
          return nameA.localeCompare(
            nameB,
            language === "zh" ? "zh-Hant" : "en"
          );
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
  }, [
    q,
    expandedTerms,
    categoryId,
    subcategoryName,
    brandFilter,
    sortBy,
    fuse,
    language,
    selectedStore.id,
  ]);

  const uniqueBrands = useMemo(() => {
    let baseResults: Product[] = PRODUCTS;

    if (categoryId) {
      const cat = CATEGORIES.find((c) => c.id === categoryId);
      if (cat) {
        baseResults = baseResults.filter((p) => isInCategory(p, cat));
      }
    }

    if (subcategoryName) {
      baseResults = baseResults.filter((p) => isInSubCategory(p, subcategoryName));
    }

    if (q) {
      const allRes = new Map<string, Product>();
      expandedTerms.forEach((term) =>
        fuse.search(term).forEach((res) => allRes.set(res.item.id, res.item))
      );
      const fuseIds = new Set(allRes.keys());
      baseResults = baseResults.filter((p) => fuseIds.has(p.id));
    }

    const brands = new Set(baseResults.map((p) => p.brand));
    // Keep the active brand selectable even if the new query no longer matches it,
    // otherwise the Select renders a blank trigger with no way to see what's filtering.
    if (brandFilter) brands.add(brandFilter);
    return Array.from(brands).sort();
  }, [q, expandedTerms, categoryId, subcategoryName, brandFilter, fuse]);

  const suggestions = useMemo(() => {
    if (!q || results.length > 0) return [];

    const nameFuse = new Fuse(PRODUCTS, {
      keys: ["product_name_en", "product_name_zh"],
      threshold: 0.5,
    });

    const matches = nameFuse.search(q);
    const uniqueMatches = new Set<string>();
    const items: { name: string; id: string }[] = [];

    for (const match of matches) {
      const name =
        language === "en"
          ? match.item.product_name_en
          : match.item.product_name_zh;

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
    const trimmed = query.trim();
    if (trimmed) addSearch(trimmed);
    const params = new URLSearchParams(window.location.search);
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    setLocation(`/search?${params.toString()}`);
  };

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(window.location.search);
      if (value) params.set(key, value);
      else params.delete(key);
      setLocation(`/search?${params.toString()}`);
    },
    [setLocation]
  );

  // Only clears the text query — category/subcategory/brand/sort filters stay applied.
  const clearSearch = () => {
    setQuery("");
    updateParam("q", null);
  };

  const activeCategory = categoryId ? CATEGORIES.find((c) => c.id === categoryId) : undefined;
  const isEmptyCategory = !q && !brandFilter && (!!categoryId || !!subcategoryName);
  const shortcutCategories = CATEGORIES.filter(
    (c) => c.id !== categoryId && countProducts(c) > 0
  ).slice(0, 4);
  const metaTitle = q
    ? language === "en"
      ? `"${q}" search results`
      : `「${q}」的搜尋結果`
    : activeCategory
      ? language === "en"
        ? activeCategory.en
        : activeCategory.zh
      : t("metaSearchTitle");
  const metaDescription = q
    ? language === "en"
      ? `${results.length} results for "${q}" at PX Mart.`
      : `全聯搜尋「${q}」共 ${results.length} 筆結果。`
    : t("metaSearchDesc");

  usePageMeta(metaTitle, metaDescription);

  return (
    <div className="flex flex-col flex-1 bg-muted/30 min-h-screen">
      <div className="bg-white dark:bg-card p-4 lg:px-6 sticky top-[var(--px-header-h)] z-40 shadow-sm border-b border-border/40 transition-colors">
        <form onSubmit={handleSearch} className="relative">
          {query !== debouncedQuery ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          )}
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
              aria-label={t("clearSearch")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {expandedTerms.length > 1 && (
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-muted-foreground shrink-0">
              {t("including")}:
            </span>
            {expandedTerms.slice(1).map((term, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-[10px] py-0 px-2 h-5 bg-muted/30 whitespace-nowrap"
              >
                {term}
              </Badge>
            ))}
          </div>
        )}

        {(categoryId || subcategoryName) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("filters")}:</span>

            {categoryId && (
              <Button
                variant="secondary"
                size="sm"
                className="h-6 text-xs rounded-full px-2 font-normal bg-primary/10 text-primary hover:bg-primary/20"
                onClick={() => updateParam("category", null)}
              >
                {activeCategory
                  ? language === "en"
                    ? activeCategory.en
                    : activeCategory.zh
                  : categoryId}
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
                  const sub = CATEGORIES.flatMap((c) => c.subCategories).find(
                    (s) => s.en === subcategoryName || s.zh === subcategoryName
                  );
                  return sub
                    ? language === "en"
                      ? sub.en
                      : sub.zh
                    : subcategoryName;
                })()}
                <X className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <Select
            value={brandFilter || "all"}
            onValueChange={(val) =>
              updateParam("brand", val === "all" ? null : val)
            }
          >
            <SelectTrigger className="h-8 text-xs w-auto min-w-[100px] rounded-full bg-muted/50 border-transparent">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue placeholder={t("brand")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allBrands")}</SelectItem>
              {uniqueBrands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(val) => updateParam("sort", val)}>
            <SelectTrigger className="h-8 text-xs w-auto min-w-[100px] rounded-full bg-muted/50 border-transparent">
              <ArrowUpDown className="w-3 h-3 mr-1" />
              <SelectValue placeholder={t("sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">{t("sortRelevance")}</SelectItem>
              <SelectItem value="name">{t("sortName")}</SelectItem>
              <SelectItem value="aisle">{t("sortAisle")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {results.length > 0 ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center px-5 py-3 shrink-0">
              <h2 className="font-semibold text-sm text-muted-foreground">
                {results.length} {t("results")}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-4">
              <motion.div
                key={debouncedQuery + sortBy + (brandFilter ?? "")}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
              >
                {results.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(index, 8) * 0.045,
                      type: "spring",
                      stiffness: 300,
                      damping: 28,
                    }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="py-12 px-4 flex flex-col items-center text-center overflow-y-auto h-full"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              {isEmptyCategory ? (
                <PackageOpen className="w-8 h-8 text-muted-foreground/40" />
              ) : (
                <Search className="w-8 h-8 text-muted-foreground/40" />
              )}
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2">
              {isEmptyCategory ? t("emptyCategoryTitle") : t("noResults")}
            </h3>
            {isEmptyCategory && (
              <p className="text-sm text-muted-foreground max-w-sm">
                {t("emptyCategoryDesc")}
              </p>
            )}

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
                {shortcutCategories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant="ghost"
                    className="justify-start h-auto py-3 px-4 bg-muted/50 hover:bg-primary/5 hover:text-primary rounded-2xl border border-transparent hover:border-primary/20 transition-all"
                    onClick={() => setLocation(`/category/${cat.id}`)}
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-bold truncate w-full">
                        {language === "en" ? cat.en : cat.zh}
                      </span>
                      <span className="text-[10px] opacity-60">
                        {cat.subCategories.length} {t("subcategoriesCount")}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}