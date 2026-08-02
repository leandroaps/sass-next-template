import "dotenv/config";

import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { uuidv7 } from "uuidv7";

import * as schema from "./schema";

const DEMO_EMAIL = "demo@sass-next-template.dev";
const DEMO_PASSWORD = "demo12345678";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema, casing: "snake_case" });

  const userId = uuidv7();
  const accountId = uuidv7();
  const organizationId = uuidv7();
  const membershipId = uuidv7();
  const projectId = uuidv7();
  const now = new Date();

  await db
    .insert(schema.user)
    .values({
      id: userId,
      name: "Demo User",
      email: DEMO_EMAIL,
      emailVerified: true,
    })
    .onConflictDoNothing({ target: schema.user.email });

  const [existingUser] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, DEMO_EMAIL));

  const resolvedUserId = existingUser?.id ?? userId;

  const [existingAccount] = await db
    .select()
    .from(schema.account)
    .where(eq(schema.account.userId, resolvedUserId));

  if (!existingAccount) {
    await db.insert(schema.account).values({
      id: accountId,
      accountId: resolvedUserId,
      providerId: "credential",
      userId: resolvedUserId,
      password: await hashPassword(DEMO_PASSWORD),
      createdAt: now,
      updatedAt: now,
    });
  }

  await db
    .insert(schema.organization)
    .values({
      id: organizationId,
      name: "Demo Org",
      slug: "demo-org",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing({ target: schema.organization.slug });

  const [existingOrg] = await db
    .select()
    .from(schema.organization)
    .where(eq(schema.organization.slug, "demo-org"));

  const resolvedOrganizationId = existingOrg?.id ?? organizationId;

  await db
    .insert(schema.membership)
    .values({
      id: membershipId,
      organizationId: resolvedOrganizationId,
      userId: resolvedUserId,
      role: "owner",
    })
    .onConflictDoNothing();

  await db
    .insert(schema.project)
    .values({
      id: projectId,
      name: "Sample Project",
      description: "Seeded example project exercising the CRUD flow.",
      organizationId: resolvedOrganizationId,
      createdById: resolvedUserId,
    })
    .onConflictDoNothing();

  await client.end();

  console.log(`Seed complete. Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
