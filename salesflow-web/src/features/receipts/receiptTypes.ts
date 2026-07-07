export interface ReceiptInvoice {
  id: number;
  invoice_no: string;
  status: string;
  total_amount: string;
  paid_amount: string;
  balance_due: string;
}

export interface ReceiptPayment {
  id: number;
  payment_no: string;
  payment_date: string;
  amount: string;
  payment_method: string;
  reference_no: string | null;
}

export interface ReceiptCustomer {
  id: number;
  customer_code: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  tax_id: string | null;
  address: string | null;
}

export interface ReceiptUser {
  id: number;
  name: string;
}

export interface Receipt {
  id: number;
  receipt_no: string;
  invoice_id: number;
  invoice?: ReceiptInvoice;
  payment_id: number;
  payment?: ReceiptPayment;
  customer_id: number;
  customer?: ReceiptCustomer;
  receipt_date: string;
  amount: string;
  payment_method: string;
  reference_no: string | null;
  notes: string | null;
  created_by?: ReceiptUser;
  updated_by?: ReceiptUser;
  created_at: string;
  updated_at: string;
}

export interface ReceiptResponse {
  receipt: Receipt;
}

export interface ReceiptListParams {
  search?: string;
  customer_id?: number;
  invoice_id?: number;
  page?: number;
  per_page?: number;
}
