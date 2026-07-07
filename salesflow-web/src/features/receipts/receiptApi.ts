import { api } from "../../lib/api";
import type { PaginatedResponse } from "../../types/pagination";
import type {
  Receipt,
  ReceiptListParams,
  ReceiptResponse,
} from "./receiptTypes";

export async function getReceiptsApi(params: ReceiptListParams = {}) {
  return api.get<PaginatedResponse<Receipt>>("/receipts", {
    params,
  });
}

export async function getReceiptApi(receiptId: number) {
  return api.get<ReceiptResponse>(`/receipts/${receiptId}`);
}
