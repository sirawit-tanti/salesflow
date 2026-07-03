import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { GuestRoute } from "../components/layout/GuestRoute";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { LoginPage } from "../features/auth/LoginPage";
import { CustomerFormPage } from "../features/customers/CustomerFormPage";
import { CustomerListPage } from "../features/customers/CustomerListPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: '/customers',
            element: <CustomerListPage />,
          },
          {
            path: '/customers/create',
            element: <CustomerFormPage />,
          },
          {
            path: '/customers/:customerId/edit',
            element: <CustomerFormPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
