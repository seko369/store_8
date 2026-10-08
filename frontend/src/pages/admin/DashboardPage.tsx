import {
  Package,
  Plus,
  Tags,
} from "lucide-react";
import { Link } from "react-router-dom";

import AdminProductTable from "../../components/AdminProductTable";
import { useAdminProducts } from "../../hooks/useAdminProducts";

export default function DashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminProducts();

  if (isLoading) {
    return (
      <section className="admin-page">
        <div className="state-card">
          <div className="loader" />
          <p>
            در حال دریافت اطلاعات داشبورد...
          </p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="admin-page">
        <div className="state-card state-card--error">
          <h2>خطا در دریافت اطلاعات</h2>

          <p>
            {error instanceof Error
              ? error.message
              : "خطای نامشخص"}
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={() => refetch()}
          >
            تلاش دوباره
          </button>
        </div>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const activeProducts = data.data.filter(
    (product) => product.is_active,
  ).length;

  const inactiveProducts =
    data.data.length - activeProducts;

  return (
    <section className="admin-page">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">
            Overview
          </span>

          <h1>داشبورد</h1>

          <p>
            نمای کلی محصولات فروشگاه
          </p>
        </div>

        <div className="dashboard-actions">
          <Link
            to="/admin/products/new"
            className="primary-button"
          >
            <Plus size={18} />
            افزودن محصول
          </Link>

          <Link
            to="/admin/categories"
            className="secondary-button"
          >
            <Tags size={18} />
            دسته‌بندی‌ها
          </Link>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card__icon">
            <Package size={20} />
          </div>

          <span>کل محصولات</span>
          <strong>
            {data.total.toLocaleString("fa-IR")}
          </strong>
        </div>

        <div className="stat-card">
          <span>محصولات فعال</span>
          <strong>
            {activeProducts.toLocaleString("fa-IR")}
          </strong>
        </div>

        <div className="stat-card">
          <span>محصولات غیرفعال</span>
          <strong>
            {inactiveProducts.toLocaleString("fa-IR")}
          </strong>
        </div>
      </div>

      <div className="dashboard-section-header">
        <div>
          <span className="eyebrow">
            Products
          </span>

          <h2>محصولات</h2>
        </div>
      </div>

      <AdminProductTable products={data.data} />
    </section>
  );
}