import { api } from "../../lib/api";
import type { PaginatedResponse } from "../../types/pagination";
import type {
  Invoice,
  InvoiceListParams,
  InvoiceResponse,
} from "./invoiceTypes";

export async function getInvoicesApi(params: InvoiceListParams = {}) {
  return api.get<PaginatedResponse<Invoice>>("/invoices", {
    params,
  });
}

export async function getInvoiceApi(invoiceId: number) {
  return api.get<InvoiceResponse>(`/invoices/${invoiceId}`);
}

export async function deleteInvoiceApi(invoiceId: number) {
  return api.delete<{ message: string }>(`/invoices/${invoiceId}`);
}
