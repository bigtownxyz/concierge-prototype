import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("hero");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center max-w-3xl">
        <h1 className="heading-display text-5xl sm:text-7xl text-text-primary mb-6">
          {t("title")}
        </h1>
        <p className="text-lg sm:text-xl text-text-muted mb-10 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
        <Link
          href="/qualify"
          className="inline-flex items-center rounded-lg bg-luxury px-8 py-4 text-base font-semibold text-background transition-all hover:bg-luxury-hover hover:shadow-lg"
        >
          {t("cta")}
        </Link>
      </div>
    </div>
  );
}
