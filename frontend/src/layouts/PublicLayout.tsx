import { Store } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-header__inner">
          <Link to="/" className="public-brand">
            <span className="public-brand__icon">
              <Store size={20} />
            </span>

            <span>
              <strong>Store</strong>
              <small>فروشگاه آنلاین</small>
            </span>
          </Link>

          <Link
            to="/admin/login"
            className="public-header__admin-link"
          >
            ورود مدیر
          </Link>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <span>Store</span>
        <span>© تمامی حقوق محفوظ است.</span>
      </footer>
    </div>
  );
}