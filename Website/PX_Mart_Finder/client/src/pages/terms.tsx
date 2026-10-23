import { useLanguage } from "@/lib/i18n";
import { usePageMeta } from "@/lib/seo";

export default function Terms() {
  const { t } = useLanguage();

  usePageMeta(t("termsTitle"), t("termsIntro"));

  const sections = [
    { title: t("termsSection1Title"), body: t("termsSection1Body") },
    { title: t("termsSection2Title"), body: t("termsSection2Body") },
    { title: t("termsSection3Title"), body: t("termsSection3Body") },
    { title: t("termsSection4Title"), body: t("termsSection4Body") },
    { title: t("termsSection5Title"), body: t("termsSection5Body") },
    { title: t("termsSection6Title"), body: t("termsSection6Body") },
  ];

  return (
    <div className="flex flex-col flex-1 bg-background min-h-screen">
      <div className="px-6 lg:px-8 py-4 border-b sticky top-[var(--px-header-h)] bg-background z-10">
        <h1 className="text-xl font-bold">{t("termsTitle")}</h1>
      </div>

      <div className="p-6 lg:p-8 max-w-2xl w-full space-y-6">
        <p className="text-sm text-muted-foreground">
          {t("legalLastUpdated")}
        </p>

        <p className="text-base leading-relaxed text-foreground">{t("termsIntro")}</p>

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
