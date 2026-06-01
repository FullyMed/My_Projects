import { useLocation, useRoute, Link } from "wouter";
import { useLanguage, useStore } from "@/lib/i18n";
import { PRODUCTS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { ArrowLeft, MapPin, Share2, Info, Heart, Map as MapIcon, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";

export default function ProductDetail() {
  const { t, language } = useLanguage();
  const { selectedStore } = useStore();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/product/:id");
  const [showOnlyWithLocation, setShowOnlyWithLocation] = useState(false);
  const similarSectionRef = useRef<HTMLDivElement>(null);
  
  const product = PRODUCTS.find(p => p.id === params?.id);

  if (!product) {
    return <div className="p-8 text-center">{t("productNotFound")}</div>;
  }

  const name = language === "en" ? product.product_name_en : product.product_name_zh;
  const category = language === "en" ? product.category_en : product.category_zh;
  const favorited = isFavorite(product.id);
  
  const location = product.locationsByStore[selectedStore.id];
  const section = location ? (language === "en" ? location.section_en : location.section_zh) : null;

  const similarProducts = PRODUCTS
    .filter(p =>
        (p.category_en === product.category_en || p.category_zh === product.category_zh) &&
        (p.id !== product.id) &&
        (!showOnlyWithLocation || p.locationsByStore[selectedStore.id])
    )
    .slice(0, showOnlyWithLocation ? 10 : 2);

  const handleShowSimilar = () => {
    setShowOnlyWithLocation(true);
    setTimeout(() => {
      similarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="flex flex-col flex-1 bg-background pb-8 lg:flex-row lg:pb-0 lg:items-start">
      {/* Hero Image — square on mobile, sticky tall column on desktop */}
      <div className="w-full aspect-square bg-muted relative lg:w-2/5 lg:shrink-0 lg:aspect-auto lg:h-[calc(100vh-72px)] lg:sticky lg:top-[72px] lg:self-start">
        <img
          src={product.image_url}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent lg:hidden" />
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 relative z-10 lg:mt-0 lg:flex-1 lg:px-8 lg:pt-8 lg:pb-12 lg:z-auto lg:overflow-y-auto">
        <div className="bg-card rounded-3xl shadow-lg border border-border/50 p-6 mb-6">
            <div className="flex justify-between items-start mb-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 px-3 py-1">
                    {category}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full w-9 h-9",
                      favorited ? "text-red-500 hover:text-red-600 bg-red-50" : "text-muted-foreground"
                    )}
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart className={cn("w-5 h-5", favorited && "fill-current")} />
                  </Button>
                  <span className="text-sm font-semibold text-muted-foreground tracking-wide uppercase self-center">
                      {product.brand}
                  </span>
                </div>
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-6 leading-snug">
                {name}
            </h1>

            {location ? (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-2xl p-5 border border-border/50 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <MapPin className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                              {t("location")}
                          </div>
                          <div className="flex items-baseline gap-3">
                              <span className="text-xl font-bold text-primary">
                                  {t("aisle")} {location.aisle}
                              </span>
                              <span className="text-lg font-semibold text-foreground/80">
                                  {t("shelf")} {location.shelf}
                              </span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 font-medium">
                              {section}
                          </div>
                      </div>
                  </div>

                  <Link href={`/store-map?store=${selectedStore.id}&aisle=${location.aisle}`}>
                    <Button className="w-full h-12 rounded-xl font-bold gap-2 shadow-sm">
                      <MapIcon className="w-5 h-5" />
                      {t("viewAisleMap")}
                    </Button>
                  </Link>
                </div>
            ) : (
              <div className="bg-destructive/5 rounded-2xl p-6 border border-destructive/20 flex flex-col items-center text-center gap-3">
                  <AlertCircle className="w-10 h-10 text-destructive/60" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">
                      {language === 'en' 
                        ? `Location data for ${selectedStore.nameEn} is not available yet.` 
                        : t("locationNotAvailable")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' ? 'Try selecting a different store branch' : '請嘗試選擇其他門市分店'}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full border-primary/30 text-primary hover:bg-primary/5 font-bold"
                    onClick={handleShowSimilar}
                  >
                    {t("showSimilarWithLocation")}
                  </Button>
              </div>
            )}
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
            <div className="mt-8" ref={similarSectionRef}>
                <h3 className="font-bold text-lg mb-4 px-1">
                  {showOnlyWithLocation ? t("availableSimilarItems") : t("similarProducts")}
                </h3>
                <div className="space-y-4">
                    {similarProducts.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
