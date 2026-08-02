import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { type Locale } from "@/i18n/routing";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ForgotPasswordContent />;
}

function ForgotPasswordContent() {
  const t = useTranslations("auth");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("resetPasswordTitle")}</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          {t("resetPasswordSubtitle")}
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
