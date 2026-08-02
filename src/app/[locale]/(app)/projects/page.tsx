import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { NewProjectForm } from "@/components/projects/new-project-form";
import { ProjectsList } from "@/components/projects/projects-list";
import { type Locale } from "@/i18n/routing";
import { fetchProjectsPage } from "@/lib/queries/projects";
import { projectKeys } from "@/lib/query-keys";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: projectKeys.list(),
    queryFn: fetchProjectsPage,
    initialPageParam: undefined,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectsContent />
    </HydrationBoundary>
  );
}

function ProjectsContent() {
  const t = useTranslations("dashboard");

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-2xl font-semibold">{t("projects")}</h1>
      <NewProjectForm />
      <ProjectsList />
    </div>
  );
}
