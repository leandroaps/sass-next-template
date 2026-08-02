import type messages from "./src/messages/pt-BR.json";
import type { routing } from "./src/i18n/routing";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
