import { Navigate, Outlet } from "react-router-dom";

import { useCurrentAdmin } from "../hooks/useAuth";


export default function RequireAuth() {
  const {
    data: admin,
    isLoading,
    isError,
  } = useCurrentAdmin();

  if (isLoading) {
    return (
      <div className="page-section">
        در حال بررسی نشست...
      </div>
    );
  }

  if (isError || !admin) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return <Outlet />;
}