import { api } from "../../lib/api";
import type {
  OutstandingInvoiceReportParams,
  OutstandingInvoiceReportResponse,
  PaymentReportParams,
  PaymentReportResponse,
  SalesReportParams,
  SalesReportResponse,
} from "./reportTypes";

export async function getSalesReportApi(params: SalesReportParams = {}) {
  return api.get<SalesReportResponse>("/reports/sales", {
    params,
  });
}

export async function getPaymentReportApi(params: PaymentReportParams = {}) {
  return api.get<PaymentReportResponse>("/reports/payments", {
    params,
  });
}

export async function getOutstandingInvoiceReportApi(
  params: OutstandingInvoiceReportParams = {},
) {
  return api.get<OutstandingInvoiceReportResponse>(
    "/reports/outstanding-invoices",
    {
      params,
    },
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
}

function buildExportFilename(prefix: string): string {
  const timestamp = new Date()
    .toISOString()
    .replaceAll(":", "-")
    .replaceAll(".", "-");

  return `${prefix}-${timestamp}.csv`;
}

export async function exportSalesReportApi(params: SalesReportParams = {}) {
  const response = await api.get<Blob>("/reports/sales/export", {
    params,
    responseType: "blob",
  });

  downloadBlob(response.data, buildExportFilename("sales-reports"));
}

export async function exportPaymentReportApi(params: PaymentReportParams = {}) {
  const response = await api.get<Blob>("/reports/payments/export", {
    params,
    responseType: "blob",
  });

  downloadBlob(response.data, buildExportFilename("payment-report"));
}

export async function exportOutstandingInvoiceReportApi(
  params: OutstandingInvoiceReportParams = {},
) {
  const response = await api.get<Blob>("/reports/outstanding-invoices/export", {
    params,
    responseType: "blob",
  });

  downloadBlob(response.data, buildExportFilename("outstanding-invoices"));
}
