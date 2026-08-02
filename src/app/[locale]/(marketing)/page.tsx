import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";

const BOOTSTRAP_COMMANDS = [
  "git clone <repo> my-project && cd my-project",
  "corepack enable && pnpm install",
  "pnpm dev",
];

const STACK = [
  "Next.js 16",
  "Better Auth",
  "Drizzle + PostgreSQL",
  "next-intl",
  "TanStack Query",
  "Cloudflare Workers",
];

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LandingContent />;
}

function LandingContent() {
  const t = useTranslations("landing");
  const common = useTranslations("common");

  return (
    <div className="landing flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-6 py-4">
        <span className="flex items-center gap-2 font-mono text-sm lowercase tracking-tight">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-accent"
          />
          {common("appName")}
        </span>
        <nav className="flex items-center gap-5">
          <LocaleSwitcher />
          <Link
            href="/login"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            {common("signIn")}
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-16 px-6 py-16 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex w-full flex-col items-start gap-6 text-left lg:w-1/2">
          <span className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
            {t("eyebrow")}
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance lg:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-md text-lg text-muted">{t("subtitle")}</p>
          <div className="flex flex-wrap items-center gap-5 pt-2">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-semibold text-accent-ink transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-safe:hover:-translate-y-0.5"
            >
              {t("cta")}
            </Link>
            <a
              href="#stack"
              className="text-sm font-medium text-muted underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("stackLink")} ↓
            </a>
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          <Terminal />
        </div>
      </main>

      <footer
        id="stack"
        className="border-t border-border px-6 py-8"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-xs tracking-[0.15em] text-muted uppercase">
            {t("builtWith")}
          </span>
          <ul className="flex flex-wrap gap-2">
            {STACK.map((item) => (
              <li
                key={item}
                className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}

function Terminal() {
  return (
    <div className="overflow-hidden rounded-lg border border-terminal-border bg-terminal shadow-xl shadow-black/10">
      <div className="flex items-center gap-1.5 border-b border-terminal-border px-4 py-3">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-terminal-border" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-terminal-border" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-terminal-border" />
      </div>
      <pre
        lang="en"
        className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-relaxed"
      >
        {BOOTSTRAP_COMMANDS.map((cmd) => (
          <div key={cmd}>
            <span className="text-terminal-accent">$</span>{" "}
            <span className="text-terminal-ink">{cmd}</span>
          </div>
        ))}
        <div className="mt-3 text-terminal-muted">
          ▲ ready on http://localhost:3000
          <span className="landing-cursor" aria-hidden />
        </div>
      </pre>
    </div>
  );
}
