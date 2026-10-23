import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductImage } from "@/components/product-image";
import { Product } from "@/lib/data";
import { useLanguage, useStore } from "@/lib/i18n";
import { useFavorites } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Heart, Info, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Button } from "./ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { language, t } = useLanguage();
  const { selectedStore } = useStore();
  const { toggleFavorite, isFavorite } = useFavorites();

  const name = language === "en" ? product.product_name_en : product.product_name_zh;
  const category = language === "en" ? product.category_en : product.category_zh;

  const location = product.locationsByStore[selectedStore.id];
  const section = location ? (language === "en" ? location.section_en : location.section_zh) : null;
  const favorited = isFavorite(product.id);

  return (
    <motion.div
      className="relative group"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Link href={`/product/${product.id}`} className="block rounded-xl">
        <Card className="overflow-hidden border-border/60 bg-card shadow-sm transition-[box-shadow,border-color] duration-200 hover:shadow-lg hover:border-primary/25">
          <CardContent className="p-0 flex">
            {/* Image */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-muted shrink-0 relative overflow-hidden">
              <ProductImage
                src={product.image_url}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
              />
            </div>

            {/* Details */}
            <div className="flex-1 p-3 pr-14 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Badge className="text-[11px] h-5 px-2 bg-primary/10 text-primary border-0 font-medium shrink-0 rounded-full hover:bg-primary/10">
                    {category}
                  </Badge>
                  <span className="text-xs text-muted-foreground truncate">{product.brand}</span>
                </div>
                <h3 className="font-semibold text-[15px] text-foreground leading-snug line-clamp-2">
                  {name}
                </h3>
              </div>

              {location ? (
                <div className="mt-2 space-y-0.5">
                  <div className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2 py-0.5 w-fit">
                    <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="text-xs font-semibold tabular-nums">
                      {t("aisle")} {location.aisle} · {t("shelf")} {location.shelf}
                    </span>
                  </div>
                  {section && (
                    <p className="text-xs text-muted-foreground px-1 truncate">
                      {section}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-1.5 text-muted-foreground mt-2 text-xs">
                  <Info className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" />
                  <span>{t("locationNotAvailable")}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-1.5 right-1.5 rounded-full shadow-sm active:scale-90",
          favorited
            ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-600 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25 dark:hover:text-red-400"
            : "bg-card/90 text-muted-foreground hover:bg-card hover:text-red-500 border border-border/60"
        )}
        // Keep the card's whileTap from firing when the heart is pressed.
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(product.id);
        }}
        aria-label={favorited ? t("removeFromFavorites") : t("addToFavorites")}
        aria-pressed={favorited}
      >
        <Heart className={cn("w-[18px] h-[18px] transition-transform duration-200 ease-out", favorited && "fill-current scale-110")} aria-hidden="true" />
      </Button>
    </motion.div>
  );
}
