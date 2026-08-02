import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { RegisterForm } from "@/components/forms/register-form";
import { Link } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RegisterContent />;
}

function RegisterContent() {
  const t = useTranslations("auth");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("registerTitle")}</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          {t("registerSubtitle")}
        </p>
      </div>
      <RegisterForm />
      <p className="text-sm">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-medium underline">
          {t("loginTitle")}
        </Link>
      </p>
    </div>
  );
}
