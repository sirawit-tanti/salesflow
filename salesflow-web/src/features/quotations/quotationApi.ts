import { api } from "../../lib/api";
import type { PaginatedResponse } from "../../types/pagination";
import type {
  Quotation,
  QuotationListParams,
  QuotationPayload,
  QuotationResponse,
} from "./quotationTypes";
import type { InvoiceResponse } from "../invoices/invoiceTypes";

export async function getQuotationsApi(params: QuotationListParams = {}) {
  return api.get<PaginatedResponse<Quotation>>("/quotations", {
    params,
  });
}

export async function getQuotationApi(quotationId: number) {
  return api.get<QuotationResponse>(`/quotations/${quotationId}`);
}

export async function createQuotationApi(payload: QuotationPayload) {
  return api.post<QuotationResponse>("/quotations", payload);
}

export async function updateQuotationApi(
  quotationId: number,
  payload: QuotationPayload,
) {
  return api.put<QuotationResponse>(`/quotations/${quotationId}`, payload);
}

export async function deleteQuotationApi(quotationId: number) {
  return api.delete<{ message: string }>(`/quotations/${quotationId}`);
}

export async function sendQuotationApi(quotationId: number) {
  return api.post<QuotationResponse>(`/quotations/${quotationId}/send`);
}

export async function acceptQuotationApi(quotationId: number) {
  return api.post<QuotationResponse>(`/quotations/${quotationId}/accept`);
}

export async function rejectQuotationApi(quotationId: number) {
  return api.post<QuotationResponse>(`/quotations/${quotationId}/reject`);
}

export async function convertQuotationToInvoiceApi(quotationId: number) {
  return api.post<InvoiceResponse>(
    `/quotations/${quotationId}/convert-to-invoice`,
  );
}
