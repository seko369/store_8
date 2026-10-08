import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth.js";

test("protected dashboard redirects an unauthenticated visitor", async ({ page }) => {
  await page.goto("/admin/dashboard");

  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "خوش آمدید" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "داشبورد" })).toHaveCount(0);
});

test("admin session survives reload and logout revokes access", async ({ page }) => {
  await loginAsAdmin(page);
  await expect(page.getByRole("button", { name: "خروج" })).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { name: "داشبورد" })).toBeVisible();

  await page.goto("/admin/products/new");
  await expect(page.getByRole("heading", { name: "افزودن محصول" })).toBeVisible();

  await page.getByRole("button", { name: "خروج" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "خوش آمدید" })).toBeVisible();
});
