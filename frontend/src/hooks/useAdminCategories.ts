import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { adminCategoriesApi } from "../api/adminCategories";

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () =>
      adminCategoriesApi.getCategories(),
  });
}

export function useCreateAdminCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) =>
      adminCategoriesApi.createCategory(name),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories"],
      });

      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
  });
}

export function useUpdateAdminCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      name,
    }: {
      categoryId: number;
      name: string;
    }) =>
      adminCategoriesApi.updateCategory(
        categoryId,
        name,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories"],
      });

      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
  });
}

export function useDeleteAdminCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: number) =>
      adminCategoriesApi.deleteCategory(categoryId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories"],
      });

      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
  });
}