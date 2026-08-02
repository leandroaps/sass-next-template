import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const email = `e2e-${Date.now().toString()}@example.com`;
const password = "e2e-password-123";

test("full auth flow: register, verify (skipped in dev), login, logout", async ({
  page,
}) => {
  await page.goto("/pt-BR/register");
  await page.getByLabel(/nome/i).fill("E2E User");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/senha/i).fill(password);
  await page.getByRole("button", { name: /criar conta/i }).click();

  await expect(page).toHaveURL(/\/pt-BR\/verify/);
});

test("demo user can log in and log out", async ({ page }) => {
  await page.goto("/pt-BR/login");
  await page.getByLabel(/email/i).fill("demo@sass-next-template.dev");
  await page.getByLabel(/senha/i).fill("demo12345678");
  await page.getByRole("button", { name: /entrar/i }).click();

  await expect(page).toHaveURL(/\/pt-BR\/dashboard/);

  await page.getByRole("button", { name: /sair/i }).click();
  await expect(page).toHaveURL(/\/pt-BR\/login/);
});
