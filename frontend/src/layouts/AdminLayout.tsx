import {
  LayoutDashboard,
  LogOut,
  Package,
  Tags,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  useAdminLogout,
  useCurrentAdmin,
} from "../hooks/useAuth";


export default function AdminLayout() {
  const navigate = useNavigate();

  const adminQuery = useCurrentAdmin();
  const logoutMutation = useAdminLogout();

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/admin/login", {
          replace: true,
        });
      },
    });
  }

  const navLinkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `admin-nav__link ${
      isActive
        ? "admin-nav__link--active"
        : ""
    }`;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__brand-mark">
            S
          </div>

          <div>
            <strong>Store Admin</strong>

            <span>
              مدیریت فروشگاه
            </span>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin/dashboard"
            className={navLinkClass}
          >
            <LayoutDashboard size={18} />
            <span>داشبورد</span>
          </NavLink>

          <NavLink
            to="/admin/products/new"
            className={navLinkClass}
          >
            <Package size={18} />
            <span>افزودن محصول</span>
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={navLinkClass}
          >
            <Tags size={18} />
            <span>دسته‌بندی‌ها</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar__bottom">
          <div className="admin-user">
            <div className="admin-user__avatar">
              {adminQuery.data?.email
                ?.charAt(0)
                .toUpperCase() ?? "A"}
            </div>

            <div className="admin-user__info">
              <span>مدیر</span>

              <strong>
                {adminQuery.data?.email ??
                  "در حال دریافت..."}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            disabled={
              logoutMutation.isPending
            }
            onClick={handleLogout}
          >
            <LogOut size={18} />

            <span>
              {logoutMutation.isPending
                ? "در حال خروج..."
                : "خروج"}
            </span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <h1>پنل مدیریت</h1>
            <p>
              مدیریت محصولات و دسته‌بندی‌های فروشگاه
            </p>
          </div>

          <div className="admin-header__user">
            {adminQuery.data?.email}
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}