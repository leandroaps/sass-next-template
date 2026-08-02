"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(event) => {
          router.replace(
            // @ts-expect-error -- params are dynamic per-route
            { pathname, params },
            { locale: event.target.value },
          );
        }}
        className="rounded-md border border-black/10 bg-transparent px-2 py-1 dark:border-white/20"
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>
    </label>
  );
}
