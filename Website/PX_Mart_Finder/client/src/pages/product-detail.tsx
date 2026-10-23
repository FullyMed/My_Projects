import { useRoute, Link } from "wouter";
import { useLanguage, useStore } from "@/lib/i18n";
import { PRODUCTS } from "@/lib/data";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { MapPin, MapPinOff, Heart, Map as MapIcon } from "lucide-react";
import { useFavorites } from "@/lib/storage";
import { usePageMeta } from "@/lib/seo";
import NotFound from "@/pages/not-found";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

export default function ProductDetail() {
  const { t, language } = useLanguage();
  const { selectedStore } = useStore();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [, params] = useRoute("/product/:id");
  const [showOnlyWithLocation, setShowOnlyWithLocation] = useState(false);
  const similarSectionRef = useRef<HTMLDivElement>(null);

  const product = PRODUCTS.find(p => p.id === params?.id);

  // wouter keeps this component mounted across /product/:id changes (e.g. tapping a
  // similar product), so per-product UI state has to be reset by hand.
  useEffect(() => {
    setShowOnlyWithLocation(false);
  }, [params?.id]);

  usePageMeta(
    product ? (language === "en" ? product.product_name_en : product.product_name_zh) : t("productNotFound"),
    product
      ? (() => {
          const loc = product.locationsByStore[selectedStore.id];
          return language === "en"
            ? `${product.brand} ${product.product_name_en} at PX Mart${loc ? `: aisle ${loc.aisle}, shelf ${loc.shelf}` : ""}.`
            : `全聯「${product.product_name_zh}」（${product.brand}）${loc ? `：走道 ${loc.aisle}、貨架 ${loc.shelf}` : ""}。`;
        })()
      : t("productNotFound")
  );

  if (!product) {
    return <NotFound />;
  }

  const name = language === "en" ? product.product_name_en : product.product_name_zh;
  const category = language === "en" ? product.category_en : product.category_zh;
  const favorited = isFavorite(product.id);
  
  const location = product.locationsByStore[selectedStore.id];
  const section = location ? (language === "en" ? location.section_en : location.section_zh) : null;

  const sameCategory = PRODUCTS.filter(p =>
    (p.category_en === product.category_en || p.category_zh === product.category_zh) &&
    p.id !== product.id
  );
  const hasSimilarWithLocation = sameCategory.some(p => p.locationsByStore[selectedStore.id]);
  const similarProducts = sameCategory
    .filter(p => !showOnlyWithLocation || p.locationsByStore[selectedStore.id])
    .slice(0, showOnlyWithLocation ? 10 : 2);

  const handleShowSimilar = () => {
    setShowOnlyWithLocation(true);
    setTimeout(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      similarSectionRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="flex flex-col flex-1 bg-background pb-8 lg:flex-row lg:items-start lg:gap-8 lg:p-8">
      {/* Hero image: full-bleed square on mobile; on desktop a square panel that sticks while the
          details scroll, so product shots aren't cropped by a tall column. */}
      <div className="w-full aspect-square bg-muted relative overflow-hidden lg:w-2/5 lg:shrink-0 lg:rounded-3xl lg:border lg:border-border/60 lg:sticky lg:top-[calc(var(--px-header-h)+2rem)]">
        <ProductImage
          src={product.image_url}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent lg:hidden" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 relative z-10 lg:mt-0 lg:px-0 lg:flex-1 lg:z-auto min-w-0">
        <div className="bg-card rounded-3xl shadow-lg lg:shadow-sm border border-border/60 p-6 mb-6">
          <div className="flex justify-between items-start gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0 pt-1.5">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-0 px-3 py-1 rounded-full">
                {category}
              </Badge>
              <span className="text-sm text-muted-foreground">{product.brand}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full shrink-0 -mr-2 -mt-1 active:scale-90",
                favorited
                  ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-600 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25 dark:hover:text-red-400"
                  : "text-muted-foreground hover:text-red-500"
              )}
              onClick={() => toggleFavorite(product.id)}
              aria-label={favorited ? t("removeFromFavorites") : t("addToFavorites")}
              aria-pressed={favorited}
            >
              <Heart className={cn("!w-5 !h-5 transition-transform duration-200 ease-out", favorited && "fill-current scale-110")} aria-hidden="true" />
            </Button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            {name}
          </h1>

          {location ? (
            <div className="space-y-4">
              <div className="bg-muted/60 rounded-2xl p-5 border border-border/60 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-0.5">
                    {t("location")}
                  </p>
                  <p className="flex flex-wrap items-baseline gap-x-3 tabular-nums">
                    <span className="text-xl font-bold text-primary">
                      {t("aisle")} {location.aisle}
                    </span>
                    <span className="text-lg font-semibold text-foreground">
                      {t("shelf")} {location.shelf}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {section}
                  </p>
                </div>
              </div>

              <Link
                href={`/store-map?store=${selectedStore.id}&aisle=${encodeURIComponent(location.aisle)}`}
                className={cn(buttonVariants(), "w-full h-12 rounded-xl font-semibold text-base gap-2")}
              >
                <MapIcon className="!w-5 !h-5" aria-hidden="true" />
                {t("viewAisleMap")}
              </Link>
            </div>
          ) : (
            // Missing aisle data isn't an error, so this uses a neutral panel, not destructive red.
            <div className="bg-muted/60 rounded-2xl p-5 border border-border/60 flex flex-col items-center text-center gap-3">
              <MapPinOff className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {language === 'en'
                    ? `We don't have aisle info for ${selectedStore.nameEn} yet.`
                    : t("locationNotAvailable")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("tryDifferentStore")}
                </p>
              </div>
              {hasSimilarWithLocation ? (
                <Button
                  variant="outline"
                  className="mt-1 w-full min-h-11 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary font-semibold"
                  onClick={handleShowSimilar}
                >
                  {t("showSimilarWithLocation")}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">{t("noSimilarWithLocation")}</p>
              )}
            </div>
          )}
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mt-8 scroll-mt-[calc(var(--px-header-h)+1rem)]" ref={similarSectionRef}>
            <h2 className="font-bold text-lg mb-4 px-1">
              {showOnlyWithLocation ? t("availableSimilarItems") : t("similarProducts")}
            </h2>
            <div className="space-y-4">
              {similarProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
