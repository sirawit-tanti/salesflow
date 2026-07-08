import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { GuestRoute } from "../components/layout/GuestRoute";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { LoginPage } from "../features/auth/LoginPage";
import { CustomerFormPage } from "../features/customers/CustomerFormPage";
import { CustomerListPage } from "../features/customers/CustomerListPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { ProductFormPage } from "../features/products/ProductFormPage";
import { ProductListPage } from "../features/products/ProductListPage";
import { QuotationDetailPage } from "../features/quotations/QuotationDetailPage";
import { QuotationFormPage } from "../features/quotations/QuotationFormPage";
import { QuotationListPage } from "../features/quotations/QuotationListPage";
import { InvoiceDetailPage } from "../features/invoices/InvoiceDetailPage";
import { InvoiceListPage } from "../features/invoices/InvoiceListPage";
import { ReceiptDetailPage } from "../features/receipts/ReceiptDetailPage";
import { ReceiptListPage } from "../features/receipts/ReceiptListPage";
import { ReportsPage } from "../features/reports/ReportsPage";

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
            path: "/customers",
            element: <CustomerListPage />,
          },
          {
            path: "/customers/create",
            element: <CustomerFormPage />,
          },
          {
            path: "/customers/:customerId/edit",
            element: <CustomerFormPage />,
          },
          {
            path: "/products",
            element: <ProductListPage />,
          },
          {
            path: "/products/create",
            element: <ProductFormPage />,
          },
          {
            path: "/products/:productId/edit",
            element: <ProductFormPage />,
          },
          {
            path: "/quotations",
            element: <QuotationListPage />,
          },
          {
            path: "/quotations/create",
            element: <QuotationFormPage />,
          },
          {
            path: "/quotations/:quotationId",
            element: <QuotationDetailPage />,
          },
          {
            path: "/quotations/:quotationId/edit",
            element: <QuotationFormPage />,
          },
          {
            path: "/invoices",
            element: <InvoiceListPage />,
          },
          {
            path: "/invoices/:invoiceId",
            element: <InvoiceDetailPage />,
          },
          {
            path: "/receipts",
            element: <ReceiptListPage />,
          },
          {
            path: "/receipts/:receiptId",
            element: <ReceiptDetailPage />,
          },
          {
            path: "/reports",
            element: <ReportsPage />,
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
