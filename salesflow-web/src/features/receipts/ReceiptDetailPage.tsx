import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatDate } from "../../lib/formatDate";
import { formatStatus } from "../../lib/formatStatus";
import { getReceiptApi } from "./receiptApi";
import type { Receipt } from "./receiptTypes";
import { downloadReceiptPdfApi } from "../pdfs/pdfApi";

export function ReceiptDetailPage() {
  const { receiptId } = useParams();

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!receiptId) {
      return;
    }

    const fetchReceipt = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getReceiptApi(Number(receiptId));
        setReceipt(response.data.receipt);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(
            error.response?.data?.message ?? "Failed to load receipt.",
          );
        } else {
          setErrorMessage("Failed to load receipt.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchReceipt();
  }, [receiptId]);

  const handleDownloadPdf = async () => {
    if (!receipt) {
      return;
    }

    setErrorMessage("");
    setIsPdfDownloading(true);

    try {
      await downloadReceiptPdfApi(receipt.id, receipt.receipt_no);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to download receipt PDF.",
        );
      } else {
        setErrorMessage("Failed to download receipt PDF.");
      }
    } finally {
      setIsPdfDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading receipt...</p>
      </div>
    );
  }

  if (errorMessage || !receipt) {
    return (
      <div>
        <Link
          to="/receipts"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to receipts
        </Link>

        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage || "Receipt not found."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            to="/receipts"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to receipts
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {receipt.receipt_no}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Receipt generated from payment {receipt.payment?.payment_no ?? "-"}.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {receipt.invoice && (
            <Link
              to={`/invoices/${receipt.invoice.id}`}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              View Invoice
            </Link>
          )}

          <button
            type="button"
            onClick={() => void handleDownloadPdf()}
            disabled={isPdfDownloading}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPdfDownloading ? "Downloading..." : "Download PDF"}
          </button>
        </div>
      </div>

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
                  {receipt.customer?.name ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Customer Code
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {receipt.customer?.customer_code ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Email
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {receipt.customer?.email ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Phone
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {receipt.customer?.phone ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Tax ID
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {receipt.customer?.tax_id ?? "-"}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Address
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-900">
                  {receipt.customer?.address ?? "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Payment Information
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Payment No
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {receipt.payment?.payment_no ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Payment Date
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {formatDate(receipt.payment?.payment_date)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Payment Method
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {formatStatus(receipt.payment_method)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Reference No
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {receipt.reference_no ?? "-"}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Notes
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-900">
                  {receipt.notes ?? "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Receipt No</dt>
                <dd className="font-medium text-slate-900">
                  {receipt.receipt_no}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-500">Receipt Date</dt>
                <dd className="font-medium text-slate-900">
                  {formatDate(receipt.receipt_date)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-500">Invoice</dt>
                <dd className="font-medium text-slate-900">
                  {receipt.invoice?.invoice_no ?? "-"}
                </dd>
              </div>

              <div className="border-t border-slate-200 pt-3" />

              <div className="flex justify-between text-base">
                <dt className="font-semibold text-slate-900">Receipt Amount</dt>
                <dd className="font-bold text-slate-900">
                  {formatCurrency(receipt.amount)}
                </dd>
              </div>

              {receipt.invoice && (
                <>
                  <div className="border-t border-slate-200 pt-3" />

                  <div className="flex justify-between">
                    <dt className="text-slate-500">Invoice Total</dt>
                    <dd className="font-medium text-slate-900">
                      {formatCurrency(receipt.invoice.total_amount)}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-slate-500">Paid</dt>
                    <dd className="font-medium text-slate-900">
                      {formatCurrency(receipt.invoice.paid_amount)}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-slate-500">Balance Due</dt>
                    <dd className="font-medium text-slate-900">
                      {formatCurrency(receipt.invoice.balance_due)}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
