import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";
import { ArrowLeft, Home, MapPinOff, Search } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="flex flex-col items-center text-center max-w-md"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 -z-10 blur-2xl bg-primary/20 dark:bg-primary/10 rounded-full" />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MapPinOff className="w-8 h-8 text-primary" />
          </div>
        </div>

        <p className="text-7xl font-extrabold tracking-tight text-primary mb-2">404</p>
        <h1 className="text-xl font-bold text-foreground mb-2">{t("pageNotFound")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("pageNotFoundDesc")}</p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/search" className={buttonVariants({ size: "lg" })}>
            <Search className="w-4 h-4" />
            {t("searchProducts")}
          </Link>
          <Link href="/" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            <Home className="w-4 h-4" />
            {t("backToHome")}
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t("goBack")}
        </button>
      </motion.div>
    </div>
  );
}
