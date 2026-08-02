import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";

import * as schema from "./schema";

async function resolveConnectionString(): Promise<string> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env: cfEnv } = await getCloudflareContext({ async: true });
    return cfEnv.HYPERDRIVE.connectionString;
  } catch {
    return env.DATABASE_URL;
  }
}

let cached: Promise<ReturnType<typeof drizzle<typeof schema>>> | undefined;

export function getDb() {
  cached ??= (async () => {
    const connectionString = await resolveConnectionString();
    const client = postgres(connectionString, { max: 10, prepare: false });
    return drizzle(client, { schema, casing: "snake_case" });
  })();

  return cached;
}
