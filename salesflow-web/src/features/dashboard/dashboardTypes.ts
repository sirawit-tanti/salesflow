export interface DashboardCustomerSummary {
  total: number;
  active: number;
}

export interface DashboardProductSummary {
  total: number;
  active: number;
  product: number;
  service: number;
}

export interface DashboardQuotationSummary {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  converted: number;
}

export interface DashboardInvoiceSummary {
  total: number;
  unpaid: number;
  partially_paid: number;
  paid: number;
  overdue: number;
}

export interface DashboardRevenueSummary {
  total_invoiced: number;
  total_paid: number;
  outstanding_balance: number;
  payment_received: number;
}

export interface DashboardRecentCustomer {
  id: number;
  customer_code: string;
  name: string;
  company_name: string | null;
}

export interface DashboardRecentQuotation {
  id: number;
  quotation_no: string;
  customer: DashboardRecentCustomer | null;
  status: string;
  issue_date: string | null;
  total_amount: string;
  created_at: string;
}

export interface DashboardRecentInvoice {
  id: number;
  invoice_no: string;
  customer: DashboardRecentCustomer | null;
  status: string;
  issue_date: string | null;
  due_date: string | null;
  total_amount: string;
  paid_amount: string;
  balance_due: string;
  created_at: string;
}

export interface DashboardRecentPaymentInvoice {
  id: number;
  invoice_no: string;
  status: string;
  customer: DashboardRecentCustomer | null;
}

export interface DashboardRecentPayment {
  id: number;
  payment_no: string;
  payment_date: string | null;
  amount: string;
  payment_method: string;
  invoice: DashboardRecentPaymentInvoice | null;
  created_at: string;
}

export interface DashboardSummaryResponse {
  summary: {
    customers: DashboardCustomerSummary;
    products: DashboardProductSummary;
    quotations: DashboardQuotationSummary;
    invoices: DashboardInvoiceSummary;
    revenue: DashboardRevenueSummary;
  };
  recent: {
    quotations: DashboardRecentQuotation[];
    invoices: DashboardRecentInvoice[];
    payments: DashboardRecentPayment[];
  };
}
