import { apiClient } from "./client";
import type {
  Product,
  ProductListResponse,
} from "../types/api";

export const productsApi = {
  getProducts(
    page = 1,
    limit = 20,
  ): Promise<ProductListResponse> {
    return apiClient<ProductListResponse>(
      "/products",
      {
        params: {
          page,
          limit,
        },
      },
    );
  },

  getProduct(
    productId: number,
  ): Promise<Product> {
    return apiClient<Product>(
      `/products/${productId}`,
    );
  },
};