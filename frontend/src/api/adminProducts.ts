import { apiClient } from "./client";
import type { Product, ProductListResponse } from "../types/api";

export const adminProductsApi = {
    deleteProduct(productId: number): Promise<void> {
  return apiClient<void>(
    `/admin/products/${productId}`,
    {
      method: "DELETE",
    },
  );
},

restoreProduct(productId: number): Promise<void> {
  return apiClient<void>(
    `/admin/products/${productId}/restore`,
    {
      method: "PATCH",
    },
  );
},
    getProduct(productId: number): Promise<Product> {
  return apiClient<Product>(
    `/admin/products/${productId}`,
  );
},

updateProduct(
  productId: number,
  formData: FormData,
): Promise<Product> {
  return apiClient<Product>(
    `/admin/products/${productId}`,
    {
      method: "PATCH",
      body: formData,
    },
  );
},
    createProduct(formData: FormData): Promise<Product> {
  return apiClient<Product>(
    "/admin/products",
    {
      method: "POST",
      body: formData,
    },
  );
},
  getProducts(
    page = 1,
    limit = 20,
  ): Promise<ProductListResponse> {
    return apiClient<ProductListResponse>(
      "/admin/products",
      {
        params: {
          page,
          limit,
        },
      },
    );
  },
};

