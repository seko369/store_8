import { Link } from "react-router-dom";

import type { Product } from "../types/api";

import {
  useDeleteAdminProduct,
  useRestoreAdminProduct,
} from "../hooks/useAdminProducts";


interface AdminProductTableProps {
  products: Product[];
}


export default function AdminProductTable({
  products,
}: AdminProductTableProps) {
  const deleteMutation = useDeleteAdminProduct();
  const restoreMutation = useRestoreAdminProduct();

  return (
    <div className="admin-product-table-wrapper">
      <table className="admin-product-table">
        <thead>
          <tr>
            <th>محصول</th>
            <th>دسته‌بندی</th>
            <th>قیمت</th>
            <th>موجودی</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>

              <td>
                {product.category.name}
              </td>

              <td>
                {product.price.toLocaleString("fa-IR")} تومان
              </td>

              <td>{product.stock}</td>

              <td>
                {product.is_active ? (
                  <span>فعال</span>
                ) : (
                  <span>غیرفعال</span>
                )}
              </td>

              <td className="admin-product-actions">
                <Link
                  to={`/admin/products/${product.id}/edit`}
                  className="secondary-button"
                >
                  ویرایش
                </Link>

                {product.is_active ? (
                  <button
                    type="button"
                    className="danger-button"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      const confirmed = window.confirm(
                        "آیا از غیرفعال کردن این محصول مطمئن هستید؟",
                      );

                      if (!confirmed) {
                        return;
                      }

                      deleteMutation.mutate(product.id);
                    }}
                  >
                    {deleteMutation.isPending
                      ? "در حال انجام..."
                      : "غیرفعال کردن"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="success-button"
                    disabled={restoreMutation.isPending}
                    onClick={() => {
                      restoreMutation.mutate(product.id);
                    }}
                  >
                    {restoreMutation.isPending
                      ? "در حال انجام..."
                      : "بازیابی"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
