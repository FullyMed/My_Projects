import { Button } from "@/components/ui/button";
import { CATEGORIES, countProducts } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import { usePageMeta } from "@/lib/seo";
import NotFound from "@/pages/not-found";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useLocation, useRoute } from "wouter";

export default function CategoryDetail() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/category/:id");

  const category = CATEGORIES.find(c => c.id === params?.id);

  usePageMeta(
    category ? (language === "en" ? category.en : category.zh) : t("categoryNotFound"),
    category
      ? language === "en"
        ? `Browse ${category.subCategories.length} subcategories in ${category.en} at PX Mart.`
        : `瀏覽全聯「${category.zh}」分類下的 ${category.subCategories.length} 個子分類。`
      : t("categoryNotFound")
  );

  if (!category) {
    return <NotFound />;
  }

  const totalCount = countProducts(category);

  return (
    <div className="flex flex-col flex-1 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-brand text-brand-foreground px-6 lg:px-8 pt-8 pb-10 rounded-b-[2rem] lg:rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" aria-hidden="true"></div>

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {language === "en" ? category.en : category.zh}
          </h1>
          <p className="text-brand-foreground/90 text-sm mt-1 tabular-nums">
            {category.subCategories.length} {t("subcategoriesCount")} · {totalCount}{" "}
            {totalCount === 1 ? t("itemCount") : t("itemsCount")}
          </p>
        </div>
      </div>

      {/* Subcategories List */}
      <div className="flex-1 p-6 lg:p-8 -mt-4 relative z-20">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {category.subCategories.map((sub, index) => {
            const count = countProducts(category, sub);
            return (
              <motion.div
                key={sub.en}
                className="min-w-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(index, 8) * 0.04,
                  type: "spring",
                  stiffness: 300,
                  damping: 26,
                }}
              >
                <Button
                  variant="outline"
                  className="group w-full justify-between h-auto min-h-16 py-3 px-5 text-base bg-card hover:bg-primary/5 hover:border-primary/30 hover:text-primary shadow-sm border-border/60 rounded-2xl"
                  onClick={() => setLocation(`/search?category=${category.id}&subcategory=${encodeURIComponent(sub.en)}`)}
                >
                  <span className="flex flex-col items-start min-w-0 text-left">
                    {/* Button sets whitespace-nowrap; long names ("Taiwanese Instant Noodles Cup & Bowls") wrap instead of widening the page at 320px. */}
                    <span className={cn("font-medium whitespace-normal", count === 0 && "text-muted-foreground")}>
                      {language === "en" ? sub.en : sub.zh}
                    </span>
                    <span className={cn("text-xs font-normal tabular-nums", count > 0 ? "text-primary" : "text-muted-foreground")}>
                      {count > 0
                        ? `${count} ${count === 1 ? t("itemCount") : t("itemsCount")}`
                        : t("comingSoon")}
                    </span>
                  </span>
                  <ChevronRight className="shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
