import { expect, test } from "@playwright/test";

interface ProductListResponse {
  data: Array<{
    id: number;
    name: string;
    description: string;
    price: number;
    category: { name: string };
  }>;
}

test("homepage shows products from the live backend", async ({ page }) => {
  const productsResponse = await page.request.get("/api/v1/products");
  expect(productsResponse.ok()).toBeTruthy();
  const products = (await productsResponse.json()) as ProductListResponse;
  expect(products.data.length).toBeGreaterThan(0);

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "محصولات موردنیازت را راحت پیدا کن." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "محصولات فروشگاه" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: products.data[0].name }),
  ).toBeVisible();
});

test("a live product card opens its detail page", async ({ page }) => {
  const productsResponse = await page.request.get("/api/v1/products");
  expect(productsResponse.ok()).toBeTruthy();
  const products = (await productsResponse.json()) as ProductListResponse;
  const product = products.data[0];
  if (!product) {
    throw new Error("The live product API returned no products.");
  }

  await page.goto("/");
  await page.getByRole("link", { name: product.name }).first().click();

  await expect(page).toHaveURL(new RegExp(`/products/${product.id}$`));
  await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
  await expect(page.getByText(product.category.name)).toBeVisible();
  await expect(
    page.getByText(product.price.toLocaleString("fa-IR"), { exact: false }),
  ).toBeVisible();
  await expect(page.getByText(product.description)).toBeVisible();
});
