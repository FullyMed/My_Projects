import { Product } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { Link } from "wouter";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { language, t } = useLanguage();

  const name = language === "en" ? product.product_name_en : product.product_name_zh;
  const category = language === "en" ? product.category_en : product.category_zh;
  const section = language === "en" ? product.section_en : product.section_zh;

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-border/60 group">
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
          <div className="flex-1 p-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-1">
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-muted text-muted-foreground font-normal">
                  {category}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">{product.brand}</span>
              </div>
              <h3 className="font-bold text-base text-foreground leading-tight line-clamp-2 mb-1">
                {name}
              </h3>
            </div>

            <div className="flex items-end gap-1 text-primary mt-2">
              <MapPin className="w-4 h-4 mb-0.5 shrink-0" />
              <div className="text-xs font-medium leading-tight">
                 <span className="block font-bold text-sm">
                   {t("aisle")} {product.aisle} • {t("shelf")} {product.shelf}
                 </span>
                 <span className="text-muted-foreground font-normal opacity-80 block truncate w-32">
                   {section}
                 </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
