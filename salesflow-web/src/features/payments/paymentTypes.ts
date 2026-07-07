import type { Invoice } from "../invoices/invoiceTypes";

export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "CREDIT_CARD"
  | "CHEQUE"
  | "OTHER";

export interface PaymentInvoice {
  id: number;
  invoice_no: string;
  status: string;
}

export interface PaymentUser {
  id: number;
  name: string;
}

export interface Payment {
  id: number;
  invoice_id: number;
  invoice?: PaymentInvoice;
  payment_no: string;
  payment_date: string;
  amount: string;
  payment_method: PaymentMethod;
  receipt?: PaymentReceipt;
  reference_no: string | null;
  notes: string | null;
  created_by?: PaymentUser;
  updated_by?: PaymentUser;
  created_at: string;
  updated_at: string;
}

export interface PaymentPayload {
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_no?: string | null;
  notes?: string | null;
}

export interface PaymentResponse {
  message?: string;
  payment: Payment;
  receipt?: PaymentReceipt;
  invoice: Invoice;
}

export interface PaymentDeleteResponse {
  message?: string;
  invoice: Invoice;
}

export interface PaymentReceipt {
  id: number;
  receipt_no: string;
}
