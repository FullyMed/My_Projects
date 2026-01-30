import { useLocation, useRoute } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function CategoryDetail() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/category/:id");
  
  const category = CATEGORIES.find(c => c.id === params?.id);

  if (!category) {
    return <div className="p-8 text-center">Category not found</div>;
  }

  return (
    <div className="flex flex-col flex-1 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 pt-8 pb-10 rounded-b-[2rem] shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

         <div className="relative z-10">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.history.back()}
              className="text-primary-foreground hover:bg-white/10 -ml-2 mb-4 pl-2 pr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("back")}
            </Button>

            <h1 className="text-2xl font-bold">
                {language === "en" ? category.en : category.zh}
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
                {category.subCategories.length} {t("categories")}
            </p>
         </div>
      </div>

      {/* Subcategories List */}
      <div className="flex-1 p-6 -mt-4 relative z-20">
        <div className="grid gap-3">
          {category.subCategories.map((sub, index) => (
             <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                    variant="outline"
                    className="w-full justify-between h-14 px-5 text-base bg-card hover:bg-primary/5 hover:border-primary/30 hover:text-primary shadow-sm border-border/60 rounded-xl"
                    onClick={() => setLocation(`/search?category=${category.id}&subcategory=${encodeURIComponent(sub.en)}`)}
                >
                    <span className="font-medium">
                        {language === "en" ? sub.en : sub.zh}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                         <Search className="w-4 h-4 text-muted-foreground" />
                    </div>
                </Button>
             </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
