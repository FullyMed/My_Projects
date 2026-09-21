import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { usePageMeta } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  const { t } = useLanguage();

  usePageMeta(t("privacyTitle"), t("privacyIntro"));

  const sections = [
    { title: t("privacySection1Title"), body: t("privacySection1Body") },
    { title: t("privacySection2Title"), body: t("privacySection2Body") },
    { title: t("privacySection3Title"), body: t("privacySection3Body") },
    { title: t("privacySection4Title"), body: t("privacySection4Body") },
    { title: t("privacySection5Title"), body: t("privacySection5Body") },
  ];

  return (
    <div className="flex flex-col flex-1 bg-background min-h-screen">
      <div className="p-4 border-b sticky top-[var(--px-header-h)] bg-background z-10 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">{t("privacyTitle")}</h1>
      </div>

      <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t("legalLastUpdated")}
        </p>

        <p className="text-sm leading-relaxed text-foreground/90">{t("privacyIntro")}</p>

        {sections.map((section, i) => (
          <div key={i} className="space-y-2">
            <h2 className="font-bold text-base text-foreground">{section.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
