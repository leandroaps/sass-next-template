import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { type Locale } from "@/i18n/routing";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DashboardContent />;
}

function DashboardContent() {
  const t = useTranslations("dashboard");

  return <h1 className="text-2xl font-semibold">{t("title")}</h1>;
}
