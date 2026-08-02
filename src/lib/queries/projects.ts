import { listProjectsAction } from "@/lib/actions/projects";

export type ProjectsPage = Awaited<ReturnType<typeof listProjectsAction>>;

export async function fetchProjectsPage({
  pageParam,
}: {
  pageParam: string | undefined;
}): Promise<ProjectsPage> {
  return listProjectsAction({ cursor: pageParam });
}
