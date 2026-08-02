import { expect, test } from "@playwright/test";

for (const locale of ["pt-BR", "en"]) {
  test(`landing page renders in ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.getByRole("link", { name: /entrar|sign in/i })).toBeVisible();
  });
}
