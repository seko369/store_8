import { ArrowLeft, PackageOpen } from "lucide-react";

import ProductCard from "../../components/ProductCard";
import { useProducts } from "../../hooks/useProducts";

export default function HomePage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts();

  if (isLoading) {
    return (
      <section className="page-shell">
        <div className="state-card">
          <div className="loader" />
          <h2>در حال دریافت محصولات</h2>
          <p>لطفاً چند لحظه صبر کنید.</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="page-shell">
        <div className="state-card state-card--error">
          <h2>دریافت محصولات ناموفق بود</h2>

          <p>
            {error instanceof Error
              ? error.message
              : "خطایی در ارتباط با سرور رخ داده است."}
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

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-section__content">
          <span className="eyebrow">
            انتخاب ساده برای خرید بهتر
          </span>

          <h1>
            محصولات موردنیازت را
            <span> راحت پیدا کن.</span>
          </h1>

          <p>
            مجموعه‌ای از محصولات منتخب با اطلاعات
            شفاف و دسترسی سریع.
          </p>

          <a
            href="#products"
            className="hero-button"
          >
            مشاهده محصولات
            <ArrowLeft size={18} />
          </a>
        </div>

        <div className="hero-section__visual">
          <div className="hero-orb hero-orb--one" />
          <div className="hero-orb hero-orb--two" />

          <div className="hero-card">
            <span>محصولات فعال</span>
            <strong>{data.total.toLocaleString("fa-IR")}</strong>
            <small>محصول برای انتخاب</small>
          </div>
        </div>
      </section>

      <section
        id="products"
        className="products-section"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              محصولات
            </span>

            <h2>محصولات فروشگاه</h2>
          </div>

          <span className="section-count">
            {data.total.toLocaleString("fa-IR")} محصول
          </span>
        </div>

        {data.data.length === 0 ? (
          <div className="state-card">
            <PackageOpen size={36} />

            <h2>
              محصولی برای نمایش وجود ندارد
            </h2>

            <p>
              در حال حاضر محصول فعالی ثبت نشده است.
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {data.data.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}