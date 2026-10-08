import { useQuery } from "@tanstack/react-query";

import { productsApi } from "../api/products";

export function useProducts(
  page = 1,
  limit = 20,
) {
  return useQuery({
    queryKey: ["products", page, limit],
    queryFn: () =>
      productsApi.getProducts(page, limit),
  });
}

export function useProduct(productId: number) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () =>
      productsApi.getProduct(productId),
    enabled: productId > 0,
  });
}