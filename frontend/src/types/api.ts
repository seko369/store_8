export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: Category;
  stock: number;
  sort_order: number;
  is_active: boolean;
}

export interface ProductListResponse {
  data: Product[];
  page: number;
  limit: number;
  total: number;
}