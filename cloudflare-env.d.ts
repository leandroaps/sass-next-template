import type { Hyperdrive } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    HYPERDRIVE: Hyperdrive;
  }
}
