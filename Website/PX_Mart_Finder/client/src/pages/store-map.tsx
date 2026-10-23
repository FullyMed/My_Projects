import { useEffect } from "react";
import { useSearch } from "wouter";
import { useLanguage, useStore } from "@/lib/i18n";
import { MapPin, Map as MapIcon } from "lucide-react";
import { motion } from "framer-motion";
import { STORE_LIST } from "@/lib/data";
import { usePageMeta } from "@/lib/seo";

export default function StoreMap() {
  const { t, language } = useLanguage();
  const { selectedStore, setStore } = useStore();

  const searchParams = new URLSearchParams(useSearch());
  const storeId = searchParams.get("store");
  // The aisle number belongs to the store in the link; hide it once the user switches branches.
  const highlightedAisle =
    !storeId || storeId === selectedStore.id ? searchParams.get("aisle") : null;

  usePageMeta(
    t("metaStoreMapTitle"),
    language === "en"
      ? `A demo aisle map for ${selectedStore.nameEn}, showing which aisle to head to.`
      : `${selectedStore.nameZh}的示意走道地圖，告訴你該往哪條走道走。`
  );

  // Sync to the linked store only when the link changes. Depending on selectedStore
  // here would snap the header's store picker back to the URL's store on every change.
  useEffect(() => {
    const foundStore = storeId ? STORE_LIST.find(s => s.id === storeId) : undefined;
    if (foundStore) {
      setStore(foundStore);
    }
  }, [storeId]);

  return (
    <div className="flex flex-col flex-1 bg-background min-h-screen">
      <div className="sticky top-[var(--px-header-h)] z-20 bg-background">
        {/* Demo banner */}
        <p className="bg-amber-100 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800/50 py-2 px-4 text-center text-xs font-medium text-amber-900 dark:text-amber-100">
          {t("demoAisleMap")}
        </p>
        <div className="px-6 lg:px-8 py-4 border-b">
          <h1 className="text-xl font-bold">{t("storeMap")}</h1>
        </div>
      </div>

      <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
        <div className="bg-primary/5 p-4 rounded-2xl border border-primary/15">
          <div className="flex items-center gap-3 mb-1.5">
            <MapPin className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
            <h2 className="font-bold text-lg">
              {language === 'en' ? selectedStore.nameEn : selectedStore.nameZh}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'en'
              ? `You're viewing the map for ${selectedStore.nameEn}.`
              : `這是${selectedStore.nameZh}的地圖。`}
          </p>
        </div>

        {highlightedAisle && (
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="bg-primary text-primary-foreground p-6 rounded-3xl shadow-md flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium opacity-90 mb-1">
                {t("goingToAisle")}
              </p>
              <p className="text-5xl font-extrabold tracking-tight tabular-nums">{highlightedAisle}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <MapPin className="w-8 h-8" aria-hidden="true" />
            </div>
          </motion.div>
        )}

        <div className="relative rounded-3xl overflow-hidden border border-border/60 bg-muted/50 min-h-[360px] lg:min-h-[480px] flex flex-col items-center justify-center p-10 text-center">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="grid grid-cols-6 h-full w-full">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border border-primary/[0.06]" />
              ))}
            </div>
          </div>

          <MapIcon className="relative w-14 h-14 text-primary/40 mb-4" aria-hidden="true" />
          <h2 className="relative text-lg font-semibold text-foreground">
            {t("storeLayoutVisual")}
          </h2>
          <p className="relative text-sm text-muted-foreground max-w-xs mt-1.5">
            {t("storeLayoutVisualization")}
          </p>
        </div>
      </div>
    </div>
  );
}
