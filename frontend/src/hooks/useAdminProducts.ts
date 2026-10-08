import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { adminProductsApi } from "../api/adminProducts";

export function useAdminProducts(
  page = 1,
  limit = 20,
) {
  return useQuery({
    queryKey: ["admin", "products", page, limit],
    queryFn: () =>
      adminProductsApi.getProducts(
        page,
        limit,
      ),
  });
}

export function useCreateAdminProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      adminProductsApi.createProduct(formData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products"],
      });
    },
  });
}

export function useAdminProduct(productId: number) {
  return useQuery({
    queryKey: ["admin", "product", productId],
    queryFn: () =>
      adminProductsApi.getProduct(productId),
    enabled: productId > 0,
  });
}
export function useUpdateAdminProduct(
  productId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      adminProductsApi.updateProduct(
        productId,
        formData,
      ),

    onSuccess: (product) => {
      queryClient.setQueryData(
        ["admin", "product", productId],
        product,
      );

      queryClient.invalidateQueries({
        queryKey: ["admin", "products"],
      });
    },
  });
}

export function useDeleteAdminProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      adminProductsApi.deleteProduct(productId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products"],
      });
    },
  });
}
export function useRestoreAdminProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      adminProductsApi.restoreProduct(productId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products"],
      });
    },
  });
}