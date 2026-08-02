import { expect, test } from "@playwright/test";

test("switching locale preserves the current route", async ({ page }) => {
  await page.goto("/pt-BR/login");
  await page.getByRole("combobox").selectOption("en");
  await expect(page).toHaveURL(/\/en\/login/);
});
