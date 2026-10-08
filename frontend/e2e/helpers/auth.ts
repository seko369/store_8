import { expect, type Page } from "@playwright/test";

export async function loginAsAdmin(page: Page): Promise<void> {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to the local admin credentials before running E2E tests.",
    );
  }

  await page.goto("/admin/login");
  await page.getByPlaceholder("admin@example.com").fill(email);
  await page.getByPlaceholder("رمز عبور").fill(password);
  await page.getByRole("button", { name: "ورود به پنل" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { name: "داشبورد" })).toBeVisible();
}
