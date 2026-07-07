import { api } from "../../lib/api";
import type {
  Payment,
  PaymentDeleteResponse,
  PaymentPayload,
  PaymentResponse,
} from "./paymentTypes";

export async function getInvoicePaymentsApi(invoiceId: number) {
  return api.get<{ data: Payment[] }>(`/invoices/${invoiceId}/payments`);
}

export async function recordPaymentApi(
  invoiceId: number,
  payload: PaymentPayload,
) {
  return api.post<PaymentResponse>(`/invoices/${invoiceId}/payments`, payload);
}

export async function deletePaymentApi(invoiceId: number, paymentId: number) {
  return api.delete<PaymentDeleteResponse>(
    `/invoices/${invoiceId}/payments/${paymentId}`,
  );
}
