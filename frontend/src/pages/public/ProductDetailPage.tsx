import {
  ArrowRight,
  Check,
  ShoppingBag,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useProduct } from "../../hooks/useProducts";
import { getAssetUrl } from "../../lib/config";

export default function ProductDetailPage() {
  const { productId } = useParams();

  const id = Number(productId);

  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useProduct(id);

  if (
    !productId ||
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return (
      <section className="page-shell">
        <div className="state-card state-card--error">
          <h2>شناسه محصول نامعتبر است.</h2>

          <Link
            to="/"
            className="primary-button"
          >
            بازگشت به فروشگاه
          </Link>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="page-shell">
        <div className="state-card">
          <div className="loader" />
          <h2>
            در حال دریافت اطلاعات محصول
          </h2>
        </div>
      </section>
    );
  }

  if (isError || !product) {
    return (
      <section className="page-shell">
        <div className="state-card state-card--error">
          <h2>محصول پیدا نشد</h2>

          <p>
            {error instanceof Error
              ? error.message
              : "این محصول دیگر در دسترس نیست."}
          </p>

          <div className="state-card__actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => refetch()}
            >
              تلاش دوباره
            </button>

            <Link
              to="/"
              className="primary-button"
            >
              بازگشت
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="product-detail-page">
      <div className="product-detail__topbar">
        <Link
          to="/"
          className="back-link"
        >
          <ArrowRight size={18} />
          بازگشت به محصولات
        </Link>
      </div>

      <div className="product-detail__card">
        <div className="product-detail__media">
          <img
            src={getAssetUrl(product.image_url)}
            alt={product.name}
          />
        </div>

        <div className="product-detail__content">
          <span className="product-detail__category">
            {product.category.name}
          </span>

          <h1>{product.name}</h1>

          <p className="product-detail__description">
            {product.description}
          </p>

          <div className="product-detail__price">
            {product.price.toLocaleString("fa-IR")}
            <small> تومان</small>
          </div>

          <div
            className={`stock-status ${
              product.stock > 0
                ? "stock-status--available"
                : "stock-status--out"
            }`}
          >
            <Check size={16} />

            {product.stock > 0
              ? `موجود — ${product.stock.toLocaleString("fa-IR")} عدد`
              : "در حال حاضر ناموجود"}
          </div>

          <button
            type="button"
            className="product-detail__cta"
            disabled={product.stock === 0}
          >
            <ShoppingBag size={19} />

            {product.stock > 0
              ? "افزودن به سبد خرید"
              : "ناموجود"}
          </button>
        </div>
      </div>
    </section>
  );
}