import { api } from "../../lib/api";
import type { PaginatedResponse } from "../../types/pagination";
import type {
  Quotation,
  QuotationListParams,
  QuotationPayload,
  QuotationResponse,
} from "./quotationTypes";

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
