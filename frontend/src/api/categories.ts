import { apiClient } from "./client";
import type { Category } from "../types/api";

export const categoriesApi = {
  getCategories(): Promise<Category[]> {
    return apiClient<Category[]>(
      "/categories",
    );
  },
};