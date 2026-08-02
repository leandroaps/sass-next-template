import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/pt-BR/login");
  await page.getByLabel(/email/i).fill("demo@sass-next-template.dev");
  await page.getByLabel(/senha/i).fill("demo12345678");
  await page.getByRole("button", { name: /entrar/i }).click();
  await expect(page).toHaveURL(/\/pt-BR\/dashboard/);
});

test("create a project and see it in the list", async ({ page }) => {
  await page.goto("/pt-BR/projects");

  const name = `E2E Project ${Date.now().toString()}`;
  await page.getByLabel(/nome do projeto/i).fill(name);
  await page.getByRole("button", { name: /novo projeto/i }).click();

  await expect(page.getByTestId("projects-list")).toContainText(name);
});
