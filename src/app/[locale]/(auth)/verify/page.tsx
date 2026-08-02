import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { type Locale } from "@/i18n/routing";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <VerifyContent />;
}

function VerifyContent() {
  const t = useTranslations("auth");

  return (
    <div className="flex flex-col gap-2 text-center">
      <h1 className="text-2xl font-semibold">{t("verifyEmailTitle")}</h1>
      <p className="text-sm text-black/60 dark:text-white/60">
        {t("verifyEmailSubtitle")}
      </p>
    </div>
  );
}
