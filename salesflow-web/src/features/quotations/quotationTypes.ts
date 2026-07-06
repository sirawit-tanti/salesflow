export type QuotationStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CONVERTED";

export interface QuotationCustomer {
  id: number;
  customer_code: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  tax_id?: string | null;
  address?: string | null;
}

export interface QuotationProduct {
  id: number;
  product_code: string;
  name: string;
  type: string;
}

export interface QuotationUser {
  id: number;
  name: string;
}

export interface QuotationItem {
  id: number;
  product_id: number | null;
  product?: QuotationProduct;
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

export interface Quotation {
  id: number;
  quotation_no: string;
  customer_id: number;
  customer?: QuotationCustomer;
  status: QuotationStatus;
  issue_date: string;
  expiry_date: string | null;
  sub_total: string;
  discount_amount: string;
  tax_rate: string;
  tax_amount: string;
  total_amount: string;
  notes: string | null;
  terms: string | null;
  items?: QuotationItem[];
  created_by?: QuotationUser;
  updated_by?: QuotationUser;
  sent_at: string | null;
  accepted_at: string | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationItemPayload {
  product_id?: number | null;
  item_name: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_amount?: number;
}

export interface QuotationPayload {
  customer_id: number;
  issue_date: string;
  expiry_date?: string | null;
  discount_amount?: number;
  tax_rate?: number;
  notes?: string | null;
  terms?: string | null;
  items: QuotationItemPayload[];
}

export interface QuotationResponse {
  message?: string;
  quotation: Quotation;
}

export interface QuotationListParams {
  search?: string;
  status?: QuotationStatus | "";
  customer_id?: number;
  page?: number;
  per_page?: number;
}
