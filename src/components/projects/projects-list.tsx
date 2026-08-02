"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { fetchProjectsPage } from "@/lib/queries/projects";
import { projectKeys } from "@/lib/query-keys";

export function ProjectsList() {
  const t = useTranslations("dashboard");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: projectKeys.list(),
      queryFn: fetchProjectsPage,
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  if (isPending || !data) return null;

  const projects = data.pages.flatMap((page) => page.items);

  if (projects.length === 0) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        {t("projectsEmpty")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul
        className="flex flex-col divide-y divide-black/10 dark:divide-white/10"
        data-testid="projects-list"
      >
        {projects.map((p) => (
          <li key={p.id} className="py-3">
            <p className="font-medium">{p.name}</p>
            {p.description ? (
              <p className="text-sm text-black/60 dark:text-white/60">
                {p.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      {hasNextPage ? (
        <Button
          variant="secondary"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="self-start"
        >
          {isFetchingNextPage ? "..." : "→"}
        </Button>
      ) : null}
    </div>
  );
}
