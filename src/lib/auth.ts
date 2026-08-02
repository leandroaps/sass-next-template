import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { uuidv7 } from "uuidv7";

import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";

export async function createAuth() {
  const db = await getDb();
  const googleClientId = env.GOOGLE_CLIENT_ID;
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET;

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const { sendMail } = await import("@/lib/mailer");
        await sendMail({
          to: user.email,
          subject: "Verify your email",
          html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
        });
      },
    },
    socialProviders:
      googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          }
        : undefined,
    plugins: [organization()],
    rateLimit: {
      enabled: true,
    },
    advanced: {
      database: {
        generateId: () => uuidv7(),
      },
    },
  });
}

export type Auth = Awaited<ReturnType<typeof createAuth>>;

let authInstance: Promise<Auth> | undefined;

export function getAuth() {
  authInstance ??= createAuth();
  return authInstance;
}
