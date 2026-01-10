import { useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage, useStore } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { STORE_LIST } from "@/lib/data";

export default function StoreMap() {
  const { t, language } = useLanguage();
  const { selectedStore, setStore } = useStore();
  const [location, setLocation] = useLocation();
  
  const searchParams = new URLSearchParams(window.location.search);
  const highlightedAisle = searchParams.get("aisle");
  const storeId = searchParams.get("store");

  useEffect(() => {
    if (storeId && storeId !== selectedStore.id) {
      const foundStore = STORE_LIST.find(s => s.id === storeId);
      if (foundStore) {
        setStore(foundStore);
      }
    }
  }, [storeId, selectedStore.id, setStore]);

  return (
    <div className="flex flex-col flex-1 bg-background min-h-screen">
      <div className="p-4 border-b sticky top-[72px] bg-background z-10 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">{t("storeMap")}</h1>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">
              {language === 'en' ? selectedStore.nameEn : selectedStore.nameZh}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground italic">
            {language === 'en' 
              ? "Tip: Use the map below to navigate the aisles." 
              : "提示：使用下方地圖瀏覽走道。"}
          </p>
        </div>

        {highlightedAisle && (
          <motion.div 
            initial={ { scale: 0.9, opacity: 0 } }
            animate={ { scale: 1, opacity: 1 } }
            className="bg-primary text-primary-foreground p-6 rounded-3xl shadow-xl flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{t("goToAisle")}</p>
              <p className="text-4xl font-black">{highlightedAisle}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <MapPin className="w-8 h-8" />
            </div>
          </motion.div>
        )}

        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-secondary">
          <img 
            src={selectedStore.aisleMapUrl || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"} 
            alt="Store Map"
            className="w-full h-auto object-cover min-h-[400px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <div className="flex flex-col">
              <p className="text-white text-sm font-bold">
                 {language === 'en' ? 'Floor Plan (Demo Placeholder)' : '平面圖（示意）'}
              </p>
              <p className="text-white/70 text-[10px] uppercase tracking-wider">
                 {language === 'en' ? 'Store Layout View' : '門店佈局視圖'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
