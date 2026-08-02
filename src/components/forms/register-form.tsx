"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormField, Input } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { signUp } from "@/lib/auth-client";
import { type RegisterInput, registerSchema } from "@/schemas/auth";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [serverError, setServerError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(undefined);
    const result = await signUp.email(data);

    if (result.error) {
      setServerError(result.error.message ?? t("signInError"));
      return;
    }

    router.push("/verify");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField label={t("name")} error={errors.name}>
        <Input autoComplete="name" {...register("name")} />
      </FormField>
      <FormField label={t("email")} error={errors.email}>
        <Input type="email" autoComplete="email" {...register("email")} />
      </FormField>
      <FormField label={t("password")} error={errors.password}>
        <Input
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
      </FormField>
      {serverError ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {t("registerTitle")}
      </Button>
    </form>
  );
}
