import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";

import { loginAsAdmin } from "./helpers/auth.js";

const imageFixture = fileURLToPath(
  new URL("./fixtures/test-product-image.png", import.meta.url),
);

interface AdminProductListResponse {
  data: Array<{ sort_order: number }>;
}

test("admin can create, upload, edit, deactivate, and restore a product", async ({
  page,
}) => {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const initialName = `E2E Test Product ${suffix}`;
  const updatedName = `E2E Updated Product ${suffix}`;

  await loginAsAdmin(page);
  const productsResponse = await page.request.get(
    "/api/v1/admin/products?limit=100",
  );
  expect(productsResponse.ok()).toBeTruthy();
  const currentProducts =
    (await productsResponse.json()) as AdminProductListResponse;
  const usedSortOrders = new Set(
    currentProducts.data.map((product) => product.sort_order),
  );
  let sortOrder = 1;
  while (usedSortOrders.has(sortOrder)) {
    sortOrder += 1;
  }

  await page.goto("/admin/products/new");

  await page.getByLabel("نام محصول").fill(initialName);
  await page.getByLabel("توضیحات").fill("Created by the real-browser E2E suite.");
  await page.getByLabel("قیمت").fill("12345");
  await page.getByLabel("دسته‌بندی").selectOption({ index: 1 });
  await page.getByLabel("موجودی").fill("3");
  await page.getByLabel("ترتیب نمایش").fill(String(sortOrder));
  await page.getByLabel("تصویر محصول").setInputFiles(imageFixture);
  await page.getByRole("button", { name: "ساخت محصول" }).click();

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  let productRow = page.getByRole("row").filter({ hasText: initialName });
  await expect(productRow).toBeVisible();
  const editHref = await productRow.getByRole("link", { name: "ویرایش" }).getAttribute("href");
  expect(editHref).toMatch(/^\/admin\/products\/\d+\/edit$/);
  const productId = editHref!.match(/\/products\/(\d+)\/edit$/)![1];

  await page.goto(`/products/${productId}`);
  const uploadedImage = page.getByRole("img", { name: initialName });
  await expect(uploadedImage).toBeVisible();
  await expect
    .poll(() => uploadedImage.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);

  await page.goto("/admin/dashboard");
  productRow = page.getByRole("row").filter({ hasText: initialName });
  await productRow.getByRole("link", { name: "ویرایش" }).click();
  await expect(page.getByRole("heading", { name: "ویرایش محصول" })).toBeVisible();
  await page.getByLabel("نام محصول").fill(updatedName);
  await page.getByRole("button", { name: "ذخیره تغییرات" }).click();

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  productRow = page.getByRole("row").filter({ hasText: updatedName });
  await expect(productRow).toBeVisible();
  await page.once("dialog", (dialog) => dialog.accept());
  await productRow.getByRole("button", { name: "غیرفعال کردن" }).click();
  await expect(productRow.getByText("غیرفعال")).toBeVisible();

  await productRow.getByRole("button", { name: "بازیابی" }).click();
  await expect(productRow.getByText("فعال")).toBeVisible();

  await page.once("dialog", (dialog) => dialog.accept());
  await productRow.getByRole("button", { name: "غیرفعال کردن" }).click();
  await expect(productRow.getByRole("button", { name: "بازیابی" })).toBeVisible();
});

test("admin can create, edit, and safely remove an unused category", async ({
  page,
}) => {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const categoryName = `E2E Category ${suffix}`;
  const updatedName = `E2E Updated Category ${suffix}`;

  await loginAsAdmin(page);
  await page.goto("/admin/categories");

  await page.getByPlaceholder("مثلاً تلویزیون").fill(categoryName);
  await page.getByRole("button", { name: "افزودن دسته‌بندی" }).click();
  await expect(page.getByText(categoryName, { exact: true })).toBeVisible();

  const categoryItem = page.getByText(categoryName, { exact: true }).locator("..");
  await categoryItem.getByRole("button", { name: "ویرایش" }).click();
  await page.getByRole("textbox").last().fill(updatedName);
  await page.getByRole("button", { name: "ذخیره" }).click();
  await expect(page.getByText(updatedName, { exact: true })).toBeVisible();

  const updatedCategoryItem = page.getByText(updatedName, { exact: true }).locator("..");
  await page.once("dialog", (dialog) => dialog.accept());
  await updatedCategoryItem.getByRole("button", { name: "حذف" }).click();
  await expect(page.getByText(updatedName, { exact: true })).toHaveCount(0);
});
