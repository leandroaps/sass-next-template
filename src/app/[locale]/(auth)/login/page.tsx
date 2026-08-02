import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { LoginForm } from "@/components/forms/login-form";
import { Link } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LoginContent />;
}

function LoginContent() {
  const t = useTranslations("auth");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("loginTitle")}</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          {t("loginSubtitle")}
        </p>
      </div>
      <LoginForm />
      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="underline">
          {t("forgotPassword")}
        </Link>
        <span>
          {t("noAccount")}{" "}
          <Link href="/register" className="font-medium underline">
            {t("registerTitle")}
          </Link>
        </span>
      </div>
    </div>
  );
}
