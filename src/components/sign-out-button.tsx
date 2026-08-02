"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  const t = useTranslations("common");
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={async () => {
        await signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      {t("signOut")}
    </Button>
  );
}
