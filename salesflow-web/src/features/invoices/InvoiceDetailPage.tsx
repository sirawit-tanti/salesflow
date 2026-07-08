import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatDate } from "../../lib/formatDate";
import { formatStatus } from "../../lib/formatStatus";
import { RecordPaymentModal } from "../payments/RecordPaymentModal";
import { deletePaymentApi } from "../payments/paymentApi";
import { getInvoiceApi } from "./invoiceApi";
import type { Invoice, InvoiceStatus } from "./invoiceTypes";
import type { Payment } from "../payments/paymentTypes";
import { useAuth } from "../auth/AuthContext";
import { canDeletePayment, canRecordPayment } from "../../lib/permissions";

function getStatusClass(status: InvoiceStatus): string {
  if (status === "UNPAID") {
    return "bg-amber-50 text-amber-700";
  }

  if (status === "PARTIALLY_PAID") {
    return "bg-blue-50 text-blue-700";
  }

  if (status === "PAID") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "OVERDUE") {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

export function InvoiceDetailPage() {
  const { user } = useAuth();

  const canRecord = canRecordPayment(user?.role?.name);
  const canDelete = canDeletePayment(user?.role?.name);

  const { invoiceId } = useParams();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] =
    useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canReceivePayment =
    canRecord &&
    (invoice?.status === "UNPAID" ||
      invoice?.status === "PARTIALLY_PAID" ||
      invoice?.status === "OVERDUE");

  useEffect(() => {
    if (!invoiceId) {
      return;
    }

    const fetchInvoice = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getInvoiceApi(Number(invoiceId));
        setInvoice(response.data.invoice);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(
            error.response?.data?.message ?? "Failed to load invoice.",
          );
        } else {
          setErrorMessage("Failed to load invoice.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchInvoice();
  }, [invoiceId]);

  const handleDeletePayment = async (payment: Payment) => {
    if (!invoice) {
      return;
    }

    const confirmed = window.confirm(`Delete payment ${payment.payment_no}?`);

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsActionLoading(true);

    try {
      const response = await deletePaymentApi(invoice.id, payment.id);

      setInvoice(response.data.invoice);
      setSuccessMessage(
        response.data.message ?? "Payment deleted successfully.",
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to delete payment.",
        );
      } else {
        setErrorMessage("Failed to delete payment.");
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading invoice...</p>
      </div>
    );
  }
  if (errorMessage || !invoice) {
    return (
      <div>
        <Link
          to="/invoices"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to invoices
        </Link>

        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage || "Invoice not found."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            to="/invoices"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to invoices
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {invoice.invoice_no}
            </h1>

            <span
              className={[
                "rounded-full px-2.5 py-1 text-xs font-medium",
                getStatusClass(invoice.status),
              ].join(" ")}
            >
              {formatStatus(invoice.status)}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Invoice generated from quotation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {invoice.quotation && (
            <Link
              to={`/quotations/${invoice.quotation.id}`}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              View Quotation
            </Link>
          )}

          {canReceivePayment && (
            <button
              type="button"
              onClick={() => setIsRecordPaymentModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Record Payment
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 w-full rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 w-full rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Customer Information
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Customer
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {invoice.customer?.name ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Customer Code
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {invoice.customer?.customer_code ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Email
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {invoice.customer?.email ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Phone
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {invoice.customer?.phone ?? "-"}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Address
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-900">
                  {invoice.customer?.address ?? "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Items</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Item
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {(invoice.items ?? []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-900">
                          {item.item_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.description || "-"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">
                        {item.quantity}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {item.unit}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">
                        {formatCurrency(item.unit_price)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">
                        {formatCurrency(item.discount_amount)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-slate-900">
                        {formatCurrency(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Payment History
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Payments recorded for this invoice.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Reference
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {(invoice.payments ?? []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No payments recorded.
                      </td>
                    </tr>
                  ) : (
                    (invoice.payments ?? []).map((payment) => (
                      <tr key={payment.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                          {payment.payment_no}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {formatDate(payment.payment_date)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {formatStatus(payment.payment_method)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {payment.reference_no ?? "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-slate-900">
                          {formatCurrency(payment.amount)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                          <div className="flex justify-end gap-2">
                            {payment.receipt && (
                              <Link
                                to={`/receipts/${payment.receipt.id}`}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                              >
                                Receipt
                              </Link>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() =>
                                  void handleDeletePayment(payment)
                                }
                                disabled={isActionLoading}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {invoice.notes && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
              <p className="mt-3 whitespace-pre-line text-sm text-slate-600">
                {invoice.notes}
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium text-slate-900">
                  {formatStatus(invoice.status)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-500">Quotation</dt>
                <dd className="font-medium text-slate-900">
                  {invoice.quotation?.quotation_no ?? "-"}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-500">Issue Date</dt>
                <dd className="font-medium text-slate-900">
                  {formatDate(invoice.issue_date)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-500">Due Date</dt>
                <dd className="font-medium text-slate-900">
                  {formatDate(invoice.due_date)}
                </dd>
              </div>

              <div className="border-t border-slate-200 pt-3" />

              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-medium text-slate-900">
                  {formatCurrency(invoice.sub_total)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-500">Discount</dt>
                <dd className="font-medium text-slate-900">
                  {formatCurrency(invoice.discount_amount)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-500">VAT {invoice.tax_rate}%</dt>
                <dd className="font-medium text-slate-900">
                  {formatCurrency(invoice.tax_amount)}
                </dd>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-3">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="font-bold text-slate-900">
                  {formatCurrency(invoice.total_amount)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-500">Paid</dt>
                <dd className="font-medium text-slate-900">
                  {formatCurrency(invoice.paid_amount)}
                </dd>
              </div>

              <div className="flex justify-between text-base">
                <dt className="font-semibold text-slate-900">Balance Due</dt>
                <dd className="font-bold text-slate-900">
                  {formatCurrency(invoice.balance_due)}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {isRecordPaymentModalOpen && (
        <RecordPaymentModal
          invoice={invoice}
          onClose={() => setIsRecordPaymentModalOpen(false)}
          onPaymentRecorded={(updatedInvoice, message) => {
            setInvoice(updatedInvoice);
            setSuccessMessage(message ?? "Payment recorded successfully.");
            setIsRecordPaymentModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
