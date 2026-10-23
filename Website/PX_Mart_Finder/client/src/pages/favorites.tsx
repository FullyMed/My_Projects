import { useLanguage } from "@/lib/i18n";
import { PRODUCTS } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { useFavorites } from "@/lib/storage";
import { usePageMeta } from "@/lib/seo";
import { motion } from "framer-motion";
import { Heart, Search } from "lucide-react";
import { Link } from "wouter";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Favorites() {
  const { t } = useLanguage();
  const { favorites } = useFavorites();

  usePageMeta(t("metaFavoritesTitle"), t("metaFavoritesDesc"));

  const favoriteProducts = PRODUCTS.filter(p => favorites.includes(p.id));

  return (
    <div className="flex flex-col flex-1 bg-muted/30 min-h-screen p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/15 text-red-500 dark:text-red-400 flex items-center justify-center">
          <Heart className="w-5 h-5 fill-current" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t("favorites")}</h1>
      </motion.div>

      {favoriteProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-red-300 dark:text-red-400/60" aria-hidden="true" />
          </div>
          <h2 className="font-bold text-lg text-foreground mb-2">{t("noFavorites")}</h2>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            {t("favoritesHint")}
          </p>
          <Link href="/search" className={cn(buttonVariants(), "mt-6 rounded-full px-6 min-h-11")}>
            <Search className="w-4 h-4" aria-hidden="true" />
            {t("searchProducts")}
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {favoriteProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: Math.min(index, 8) * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 28,
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
