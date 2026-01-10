import { useLanguage } from "@/lib/i18n";
import { PRODUCTS } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { useFavorites } from "@/lib/storage";
import { Heart } from "lucide-react";

export default function Favorites() {
  const { t } = useLanguage();
  const { favorites } = useFavorites();
  
  const favoriteProducts = PRODUCTS.filter(p => favorites.includes(p.id));

  return (
    <div className="flex flex-col flex-1 bg-muted/30 min-h-screen p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t("favorites")}</h1>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
          <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">{t("noFavorites")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {favoriteProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
