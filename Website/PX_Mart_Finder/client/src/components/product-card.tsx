import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/data";
import { useLanguage, useStore } from "@/lib/i18n";
import { useFavorites } from "@/lib/storage";
import { cn } from "@/lib/utils";
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
    <div className="relative group">
      <Link href={`/product/${product.id}`}>
        <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-border/60">
          <CardContent className="p-0 flex">
            {/* Image */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-muted shrink-0 relative overflow-hidden">
               <img 
                 src={product.image_url} 
                 alt={name}
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
               />
            </div>

            {/* Details */}
            <div className="flex-1 p-3 pr-12 flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-2 mb-1 min-w-0">
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-muted text-muted-foreground font-normal shrink-0">
                    {category}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium truncate max-w-[9rem]">{product.brand}</span>
                </div>
                <h3 className="font-bold text-base text-foreground leading-tight line-clamp-2 mb-1">
                  {name}
                </h3>
              </div>

              {location ? (
                <div className="flex items-end gap-1 text-primary mt-2">
                  <MapPin className="w-4 h-4 mb-0.5 shrink-0" />
                  <div className="text-xs font-medium leading-tight">
                     <span className="block font-bold text-sm">
                       {t("aisle")} {location.aisle} • {t("shelf")} {location.shelf}
                     </span>
                     <span className="text-muted-foreground font-normal opacity-80 block truncate w-32">
                       {section}
                     </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground mt-2 italic text-xs">
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
          "absolute top-2 right-2 rounded-full w-8 h-8 shadow-sm backdrop-blur-md transition-all",
          favorited ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-white/80 text-muted-foreground hover:bg-white"
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(product.id);
        }}
      >
        <Heart className={cn("w-4 h-4", favorited && "fill-current")} />
      </Button>
    </div>
  );
}