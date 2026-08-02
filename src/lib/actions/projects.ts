"use server";

import { and, desc, eq, lt } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { getDb } from "@/db";
import { membership, project } from "@/db/schema";
import { getAuth } from "@/lib/auth";
import { createProjectSchema } from "@/schemas/project";

function zodFieldErrors(error: z.ZodError): Partial<Record<string, string[]>> {
  const fieldErrors: Partial<Record<string, string[]>> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string") continue;

    (fieldErrors[key] ??= []).push(issue.message);
  }

  return fieldErrors;
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors: Partial<Record<string, string[]>>; message?: string };

async function requireActiveOrganization() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { session: undefined, organizationId: undefined };
  }

  const db = await getDb();
  const [firstMembership] = await db
    .select({ organizationId: membership.organizationId })
    .from(membership)
    .where(eq(membership.userId, session.user.id))
    .limit(1);

  return {
    session,
    organizationId: firstMembership?.organizationId,
  };
}

export async function createProjectAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createProjectSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
  }

  const { session, organizationId } = await requireActiveOrganization();

  if (!session || !organizationId) {
    return { ok: false, fieldErrors: {}, message: "Not authenticated" };
  }

  const db = await getDb();
  const [created] = await db
    .insert(project)
    .values({
      name: parsed.data.name,
      description: parsed.data.description,
      organizationId,
      createdById: session.user.id,
    })
    .returning({ id: project.id });

  if (!created) {
    return { ok: false, fieldErrors: {}, message: "Failed to create project" };
  }

  return { ok: true, data: { id: created.id } };
}

export async function listProjectsAction(params: {
  cursor?: string;
  limit?: number;
}) {
  const { organizationId } = await requireActiveOrganization();
  const limit = params.limit ?? 20;

  if (!organizationId) {
    return { items: [], nextCursor: undefined };
  }

  const db = await getDb();
  const items = await db
    .select()
    .from(project)
    .where(
      params.cursor
        ? and(
            eq(project.organizationId, organizationId),
            lt(project.id, params.cursor),
          )
        : eq(project.organizationId, organizationId),
    )
    .orderBy(desc(project.id))
    .limit(limit + 1);

  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;

  return {
    items: page,
    nextCursor: hasMore ? page[page.length - 1]?.id : undefined,
  };
}
