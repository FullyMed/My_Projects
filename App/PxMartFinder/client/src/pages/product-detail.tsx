import { useLocation, useRoute } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { PRODUCTS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { ArrowLeft, MapPin, Share2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/product/:id");
  
  const product = PRODUCTS.find(p => p.id === params?.id);

  if (!product) {
    return <div className="p-8 text-center">Product not found</div>;
  }

  const name = language === "en" ? product.product_name_en : product.product_name_zh;
  const category = language === "en" ? product.category_en : product.category_zh;
  const section = language === "en" ? product.section_en : product.section_zh;

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
                <span className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                    {product.brand}
                </span>
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-6 leading-snug">
                {name}
            </h1>

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
                            {t("aisle")} {product.aisle}
                        </span>
                        <span className="text-lg font-semibold text-foreground/80">
                            {t("shelf")} {product.shelf}
                        </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 font-medium">
                        {section}
                    </div>
                </div>
            </div>
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
