import { apiClient } from "./client";

import type { Category } from "../types/api";

interface MessageResponse {
  message: string;
}

export const adminCategoriesApi = {
  getCategories(): Promise<Category[]> {
    return apiClient<Category[]>(
      "/admin/categories",
    );
  },

  createCategory(
    name: string,
  ): Promise<Category> {
    return apiClient<Category>(
      "/admin/categories",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      },
    );
  },

  updateCategory(
    categoryId: number,
    name: string,
  ): Promise<Category> {
    return apiClient<Category>(
      `/admin/categories/${categoryId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      },
    );
  },

  deleteCategory(
    categoryId: number,
  ): Promise<MessageResponse> {
    return apiClient<MessageResponse>(
      `/admin/categories/${categoryId}`,
      {
        method: "DELETE",
      },
    );
  },
};