import { useLanguage } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Language; label: string; flag: string; lang: string }[] = [
  { value: "en", label: "EN", flag: "🇺🇸", lang: "en" },
  { value: "zh", label: "繁中", flag: "🇹🇼", lang: "zh-Hant-TW" },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center shrink-0 bg-black/15 rounded-full p-0.5 sm:p-1 gap-0.5 border border-white/20">
      {OPTIONS.map((option) => {
        const active = language === option.value;
        return (
          <button
            key={option.value}
            type="button"
            lang={option.lang}
            aria-pressed={active}
            onClick={() => setLanguage(option.value)}
            className={cn(
              // The ::after pad stretches the tap area to about 44px tall without enlarging the pill.
              "relative rounded-full px-2.5 sm:px-3 h-8 text-xs font-medium transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-y-1.5 after:inset-x-0",
              active
                ? "bg-white text-[hsl(215_90%_32%)] shadow-sm"
                : "text-brand-foreground hover:bg-white/15"
            )}
          >
            {option.label}
            <span className="hidden sm:inline" aria-hidden="true"> {option.flag}</span>
          </button>
        );
      })}
    </div>
  );
}
