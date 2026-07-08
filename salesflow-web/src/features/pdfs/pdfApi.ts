import { api } from "../../lib/api";
import { downloadBlob, sanitizeFilename } from "../../lib/downloadFile";

export async function downloadQuotationPdfApi(
  quotationId: number,
  quotationNo: string,
) {
  const response = await api.get<Blob>(`/quotations/${quotationId}/pdf`, {
    responseType: "blob",
  });

  downloadBlob(response.data, `quotation-${sanitizeFilename(quotationNo)}.pdf`);
}

export async function downloadInvoicePdfApi(
  invoiceId: number,
  invoiceNo: string,
) {
  const response = await api.get<Blob>(`/invoices/${invoiceId}/pdf`, {
    responseType: "blob",
  });

  downloadBlob(response.data, `invoice-${sanitizeFilename(invoiceNo)}.pdf`);
}

export async function downloadReceiptPdfApi(
  receiptId: number,
  receiptNo: string,
) {
  const response = await api.get<Blob>(`/receipts/${receiptId}/pdf`, {
    responseType: "blob",
  });

  downloadBlob(response.data, `receipt-${sanitizeFilename(receiptNo)}.pdf`);
}
