import { useLocation, useRoute, Link } from "wouter";
import { useLanguage, useStore } from "@/lib/i18n";
import { PRODUCTS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { ArrowLeft, MapPin, Share2, Info, Heart, Map as MapIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "@/lib/storage";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const { t, language } = useLanguage();
  const { selectedStore } = useStore();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/product/:id");
  
  const product = PRODUCTS.find(p => p.id === params?.id);

  if (!product) {
    return <div className="p-8 text-center">Product not found</div>;
  }

  const name = language === "en" ? product.product_name_en : product.product_name_zh;
  const category = language === "en" ? product.category_en : product.category_zh;
  const favorited = isFavorite(product.id);
  
  const location = product.locationsByStore[selectedStore.id];
  const section = location ? (language === "en" ? location.section_en : location.section_zh) : null;

  const similarProducts = PRODUCTS
    .filter(p => 
        (p.category_en === product.category_en) && 
        (p.id !== product.id)
    )
    .slice(0, 2);

  return (
    <div className="flex flex-col flex-1 bg-background pb-8">
      {/* Hero Image */}
      <div className="w-full aspect-square bg-muted relative">
        <img 
          src={product.image_url} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 relative z-10">
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
              <div className="bg-muted/30 rounded-2xl p-6 border border-dashed border-muted-foreground/30 flex flex-col items-center text-center gap-2">
                  <Info className="w-8 h-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground font-medium">
                    {t("locationNotAvailable")}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {language === 'en' ? 'Try selecting a different store branch' : '請嘗試選擇其他門店分店'}
                  </p>
              </div>
            )}
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
            <div className="mt-8">
                <h3 className="font-bold text-lg mb-4 px-1">{t("similarProducts")}</h3>
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
