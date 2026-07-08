export type ReportTab = "sales" | "payments" | "outstanding";

export interface ReportCustomer {
  id: number;
  customer_code: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
}

export interface ReportInvoice {
  id: number;
  invoice_no: string;
  customer_id: number;
  customer?: ReportCustomer;
  status: string;
  issue_date: string | null;
  due_date: string | null;
  total_amount: string;
  paid_amount: string;
  balance_due: string;
  created_at: string;
  updated_at: string;
}

export interface ReportPaymentInvoice {
  id: number;
  invoice_no: string;
  customer_id: number;
  customer?: ReportCustomer;
  status: string;
  total_amount: string;
  paid_amount: string;
  balance_due: string;
}

export interface ReportPayment {
  id: number;
  invoice_id: number;
  invoice?: ReportPaymentInvoice;
  payment_no: string;
  payment_date: string | null;
  amount: string;
  payment_method: string;
  reference_no: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesReportSummary {
  total_invoices: number;
  total_amount: number;
  total_paid: number;
  total_balance_due: number;
}

export interface PaymentReportSummary {
  total_payments: number;
  total_amount: number;
}

export interface OutstandingInvoiceReportSummary {
  total_invoices: number;
  total_outstanding: number;
}

export interface ReportMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface SalesReportResponse {
  summary: SalesReportSummary;
  data: ReportInvoice[];
  meta: ReportMeta;
}

export interface PaymentReportResponse {
  summary: PaymentReportSummary;
  data: ReportPayment[];
  meta: ReportMeta;
}

export interface OutstandingInvoiceReportResponse {
  summary: OutstandingInvoiceReportSummary;
  data: ReportInvoice[];
  meta: ReportMeta;
}

export interface SalesReportParams {
  start_date?: string;
  end_date?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export interface PaymentReportParams {
  start_date?: string;
  end_date?: string;
  payment_method?: string;
  page?: number;
  per_page?: number;
}

export interface OutstandingInvoiceReportParams {
  status?: string;
  page?: number;
  per_page?: number;
}
