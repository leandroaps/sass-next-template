"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { FormField, Input } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { type ActionResult, createProjectAction } from "@/lib/actions/projects";
import { type ProjectsPage } from "@/lib/queries/projects";
import { projectKeys } from "@/lib/query-keys";
import { type CreateProjectInput, createProjectSchema } from "@/schemas/project";

export function NewProjectForm() {
  const t = useTranslations("dashboard");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
  });

  const mutation = useMutation<
    ActionResult<{ id: string }>,
    Error,
    CreateProjectInput,
    { previous: unknown }
  >({
    mutationFn: createProjectAction,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.list() });
      const previous = queryClient.getQueryData(projectKeys.list());

      queryClient.setQueryData(
        projectKeys.list(),
        (data: { pages: ProjectsPage[]; pageParams: unknown[] } | undefined) => {
          if (!data) return data;

          const optimisticProject = {
            id: `optimistic-${crypto.randomUUID()}`,
            name: input.name,
            description: input.description ?? null,
          };

          const [firstPage, ...rest] = data.pages;
          if (!firstPage) return data;

          return {
            ...data,
            pages: [
              { ...firstPage, items: [optimisticProject, ...firstPage.items] },
              ...rest,
            ],
          };
        },
      );

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(projectKeys.list(), context.previous);
      }
    },
    onSuccess: (result) => {
      if (!result.ok) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof CreateProjectInput, {
              message: messages[0],
            });
          }
        }
        return;
      }

      reset();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <FormField label={t("projectName")} error={errors.name}>
        <Input {...register("name")} />
      </FormField>
      <FormField label={t("projectDescription")} error={errors.description}>
        <Input {...register("description")} />
      </FormField>
      <Button
        type="submit"
        disabled={isSubmitting || mutation.isPending}
        className="self-start"
      >
        {t("newProject")}
      </Button>
    </form>
  );
}
