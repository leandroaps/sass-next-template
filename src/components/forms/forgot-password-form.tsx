"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormField, Input } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { type ForgotPasswordInput, forgotPasswordSchema } from "@/schemas/auth";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: "/reset-password",
    });
    setSent(true);
  });

  if (sent) {
    return (
      <p className="text-sm text-black/70 dark:text-white/70">
        {t("verifyEmailSubtitle")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField label={t("email")} error={errors.email}>
        <Input type="email" autoComplete="email" {...register("email")} />
      </FormField>
      <Button type="submit" disabled={isSubmitting}>
        {t("resetPasswordTitle")}
      </Button>
    </form>
  );
}
