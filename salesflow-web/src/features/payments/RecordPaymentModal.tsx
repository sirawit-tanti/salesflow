import axios from "axios";
import { useState } from "react";
import { formatCurrency } from "../../lib/formatCurrency";
import type { Invoice } from "../invoices/invoiceTypes";
import { recordPaymentApi } from "./paymentApi";
import type { PaymentMethod, PaymentPayload } from "./paymentTypes";

interface RecordPaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
  onPaymentRecorded: (invoice: Invoice, message?: string) => void;
}

interface PaymentFormState {
  payment_date: string;
  amount: string;
  payment_method: PaymentMethod;
  reference_no: string;
  notes: string;
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyStringToNull(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue === "" ? null : trimmedValue;
}

function buildPayload(form: PaymentFormState): PaymentPayload {
  return {
    payment_date: form.payment_date,
    amount: Number(form.amount || 0),
    payment_method: form.payment_method,
    reference_no: emptyStringToNull(form.reference_no),
    notes: emptyStringToNull(form.notes),
  };
}

const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
  },
  {
    value: "CASH",
    label: "Cash",
  },
  {
    value: "CREDIT_CARD",
    label: "Credit Card",
  },
  {
    value: "CHEQUE",
    label: "Cheque",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

export function RecordPaymentModal({
  invoice,
  onClose,
  onPaymentRecorded,
}: RecordPaymentModalProps) {
  const [form, setForm] = useState<PaymentFormState>({
    payment_date: todayDateString(),
    amount: invoice.balance_due,
    payment_method: "BANK_TRANSFER",
    reference_no: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (field: keyof PaymentFormState, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Record Payment
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Invoice {invoice.invoice_no} · Balance{" "}
            {formatCurrency(invoice.balance_due)}
          </p>
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();

            setErrorMessage("");
            setIsSubmitting(true);

            try {
              const payload = buildPayload(form);
              const response = await recordPaymentApi(invoice.id, payload);

              onPaymentRecorded(response.data.invoice, response.data.message);
            } catch (error) {
              if (axios.isAxiosError(error)) {
                const validationErrors = error.response?.data?.errors as
                  | Record<string, string[]>
                  | undefined;

                if (validationErrors) {
                  const firstError = Object.values(validationErrors).flat()[0];
                  setErrorMessage(firstError ?? "Validation failed.");
                } else {
                  setErrorMessage(
                    error.response?.data?.message ??
                      "Failed to record payment.",
                  );
                }
              } else {
                setErrorMessage("Failed to record payment.");
              }
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="space-y-5 px-6 py-5"
        >
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div>
            <label
              htmlFor="payment_date"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Payment Date <span className="text-red-500">*</span>
            </label>

            <input
              id="payment_date"
              type="date"
              value={form.payment_date}
              onChange={(event) =>
                updateField("payment_date", event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="amount"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Amount <span className="text-red-500">*</span>
            </label>

            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              max={invoice.balance_due}
              value={form.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
            />

            <p className="mt-1 text-xs text-slate-500">
              Maximum amount: {formatCurrency(invoice.balance_due)}
            </p>
          </div>

          <div>
            <label
              htmlFor="payment_method"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Payment Method <span className="text-red-500">*</span>
            </label>

            <select
              id="payment_method"
              value={form.payment_method}
              onChange={(event) =>
                updateField("payment_method", event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
            >
              {paymentMethods.map((paymentMethod) => (
                <option key={paymentMethod.value} value={paymentMethod.value}>
                  {paymentMethod.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="reference_no"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Reference No
            </label>

            <input
              id="reference_no"
              type="text"
              value={form.reference_no}
              onChange={(event) =>
                updateField("reference_no", event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="KBANK-001, slip no, cheque no..."
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Notes
            </label>

            <textarea
              id="notes"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="Payment note..."
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
