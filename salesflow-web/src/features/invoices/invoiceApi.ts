import { api } from "../../lib/api";
import type { PaginatedResponse } from "../../types/pagination";
import type {
  Invoice,
  InvoiceListParams,
  InvoiceResponse,
} from "./invoiceTypes";

export interface MarkOverdueInvoicesResponse {
  message: string;
  updated_count: number;
}

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

export async function markOverdueInvoicesApi() {
  return api.post<MarkOverdueInvoicesResponse>("/invoices/mark-overdue");
}
