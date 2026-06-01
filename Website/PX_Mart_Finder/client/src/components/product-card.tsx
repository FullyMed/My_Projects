import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
      <Link href={`/product/${product.id}`}>
        <Card className="overflow-hidden cursor-pointer border-border/50 bg-card transition-shadow duration-200 hover:shadow-lg hover:border-primary/20">
          <CardContent className="p-0 flex">
            {/* Image */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-muted shrink-0 relative overflow-hidden">
              <img
                src={product.image_url}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
              />
            </div>

            {/* Details */}
            <div className="flex-1 p-3 pr-12 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-0 font-medium shrink-0 rounded-full">
                    {category}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground/70 font-medium truncate">{product.brand}</span>
                </div>
                <h3 className="font-semibold text-[15px] text-foreground leading-snug line-clamp-2">
                  {name}
                </h3>
              </div>

              {location ? (
                <div className="mt-2 space-y-0.5">
                  <div className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2 py-0.5 w-fit">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="text-[11px] font-bold">
                      {t("aisle")} {location.aisle} · {t("shelf")} {location.shelf}
                    </span>
                  </div>
                  {section && (
                    <p className="text-[10px] text-muted-foreground/70 px-1 truncate max-w-[9rem]">
                      {section}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground/50 mt-2 text-[11px]">
                  <Info className="w-3 h-3" />
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
          "absolute top-2 right-2 rounded-full w-8 h-8 transition-all duration-200 shadow-sm active:scale-90",
          favorited
            ? "bg-red-50 text-red-500 hover:bg-red-100"
            : "bg-white/80 dark:bg-card/80 text-muted-foreground hover:bg-white dark:hover:bg-card hover:text-red-400 backdrop-blur-sm"
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(product.id);
        }}
      >
        <Heart className={cn("w-4 h-4 transition-transform duration-200", favorited && "fill-current scale-110")} />
      </Button>
    </motion.div>
  );
}
