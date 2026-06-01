import { useLanguage } from "@/lib/i18n";
import { PRODUCTS } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { useFavorites } from "@/lib/storage";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function Favorites() {
  const { t, language } = useLanguage();
  const { favorites } = useFavorites();

  const favoriteProducts = PRODUCTS.filter(p => favorites.includes(p.id));

  return (
    <div className="flex flex-col flex-1 bg-muted/30 min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center shadow-sm">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t("favorites")}</h1>
      </motion.div>

      {favoriteProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-28 h-28 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-6 shadow-inner">
            <Heart className="w-12 h-12 text-red-200 dark:text-red-900/60" />
          </div>
          <h3 className="font-bold text-lg text-foreground mb-2">{t("noFavorites")}</h3>
          <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed">
            {language === "en"
              ? "Tap the heart on any product to save it here."
              : "點擊商品上的愛心即可收藏。"}
          </p>
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
