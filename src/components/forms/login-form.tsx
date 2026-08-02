"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormField, Input } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { signIn } from "@/lib/auth-client";
import { type LoginInput, loginSchema } from "@/schemas/auth";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [serverError, setServerError] = useState<string>();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(undefined);
    const result = await signIn.email(data);

    if (result.error) {
      if (result.error.status === 401 || result.error.status === 403) {
        setError("password", { message: t("signInError") });
      } else {
        setServerError(result.error.message ?? t("signInError"));
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField label={t("email")} error={errors.email}>
        <Input type="email" autoComplete="email" {...register("email")} />
      </FormField>
      <FormField label={t("password")} error={errors.password}>
        <Input
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
      </FormField>
      {serverError ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {t("loginTitle")}
      </Button>
    </form>
  );
}
