import { createBrowserRouter, Navigate } from "react-router-dom";

import RequireAuth from "../components/RequireAuth";
import AdminLayout from "../layouts/AdminLayout";

import LoginPage from "../pages/admin/LoginPage";
import DashboardPage from "../pages/admin/DashboardPage";
import CreateProductPage from "../pages/admin/CreateProductPage";
import EditProductPage from "../pages/admin/EditProductPage";
import CategoriesPage from "../pages/admin/CategoriesPage";
import PublicLayout from "../layouts/PublicLayout";
import HomePage from "../pages/public/HomePage";
import ProductDetailPage from "../pages/public/ProductDetailPage";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "products/:productId",
        element: <ProductDetailPage />,
      },
    ],
  },

{
  path: "/admin/login",
  element: <LoginPage />,
},

{
  path: "/admin",
  element: <RequireAuth />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        {
          index: true,
          element: (
            <Navigate
              to="dashboard"
              replace
            />
          ),
        },
        {
          path: "dashboard",
          element: <DashboardPage />,
        },
        {
          path: "products/new",
          element: <CreateProductPage />,
        },
        {
          path: "products/:productId/edit",
          element: <EditProductPage />,
        },
        {
          path: "categories",
          element: <CategoriesPage />,
        },
      ],
    },
  ],
},
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);