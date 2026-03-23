import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { isRtl, type Locale } from "@/i18n/config";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <div dir={isRtl(locale as Locale) ? "rtl" : "ltr"}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <TooltipProvider delayDuration={300}>
          {children}
        </TooltipProvider>
      </NextIntlClientProvider>
    </div>
  );
}
