export type InvoiceStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export interface InvoiceCustomer {
  id: number;
  customer_code: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  tax_id?: string | null;
  address?: string | null;
}

export interface InvoiceQuotation {
  id: number;
  quotation_no: string;
  status: string;
}

export interface InvoiceProduct {
  id: number;
  product_code: string;
  name: string;
  type: string;
}

export interface InvoiceUser {
  id: number;
  name: string;
}

export interface InvoiceItem {
  id: number;
  product_id: number | null;
  product?: InvoiceProduct;
  item_name: string;
  description: string | null;
  quantity: string;
  unit: string;
  unit_price: string;
  discount_amount: string;
  tax_amount: string;
  line_total: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  invoice_no: string;
  quotation_id: number | null;
  quotation?: InvoiceQuotation;
  customer_id: number;
  customer?: InvoiceCustomer;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  sub_total: string;
  discount_amount: string;
  tax_rate: string;
  tax_amount: string;
  total_amount: string;
  paid_amount: string;
  balance_due: string;
  notes: string | null;
  items: InvoiceItem[];
  created_by?: InvoiceUser;
  updated_by?: InvoiceUser;
  created_at: string;
  updated_at: string;
}

export interface InvoiceResponse {
  message?: string;
  invoice: Invoice;
}

export interface InvoiceListParams {
  search?: string;
  status?: InvoiceStatus | "";
  customer_id?: number;
  page?: number;
  per_page?: number;
}
