import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

import type messages from "../messages/pt-BR.json";

type Messages = typeof messages;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const loaded = (await import(`../messages/${locale}.json`)) as {
    default: Messages;
  };

  return {
    locale,
    messages: loaded.default,
  };
});
