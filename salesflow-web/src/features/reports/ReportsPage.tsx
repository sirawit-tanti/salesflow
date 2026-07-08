import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatDate } from "../../lib/formatDate";
import { formatStatus } from "../../lib/formatStatus";
import {
  exportOutstandingInvoiceReportApi,
  exportPaymentReportApi,
  exportSalesReportApi,
  getOutstandingInvoiceReportApi,
  getPaymentReportApi,
  getSalesReportApi,
} from "./reportApi";
import type {
  OutstandingInvoiceReportResponse,
  PaymentReportResponse,
  ReportTab,
  SalesReportResponse,
} from "./reportTypes";

interface SummaryCardProps {
  title: string;
  value: string | number;
  description?: string;
}

function SummaryCard({ title, value, description }: SummaryCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {description && (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}

const invoiceStatuses = [
  "",
  "UNPAID",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

const outstandingStatuses = ["", "UNPAID", "PARTIALLY_PAID", "OVERDUE"];

const paymentMethods = [
  "",
  "CASH",
  "BANK_TRANSFER",
  "CREDIT_CARD",
  "CHEQUE",
  "OTHER",
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");

  const [salesReport, setSalesReport] = useState<SalesReportResponse | null>(
    null,
  );
  const [paymentReport, setPaymentReport] =
    useState<PaymentReportResponse | null>(null);
  const [outstandingReport, setOutstandingReport] =
    useState<OutstandingInvoiceReportResponse | null>(null);

  const [salesStartDate, setSalesStartDate] = useState("");
  const [salesEndDate, setSalesEndDate] = useState("");
  const [salesStatus, setSalesStatus] = useState("");
  const [salesPage, setSalesPage] = useState(1);

  const [paymentStartDate, setPaymentStartDate] = useState("");
  const [paymentEndDate, setPaymentEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentPage, setPaymentPage] = useState(1);

  const [outstandingStatus, setOutstandingStatus] = useState("");
  const [outstandingPage, setOutstandingPage] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchSalesReport = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getSalesReportApi({
        start_date: salesStartDate || undefined,
        end_date: salesEndDate || undefined,
        status: salesStatus || undefined,
        page: salesPage,
        per_page: 10,
      });

      setSalesReport(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to load sales report.",
        );
      } else {
        setErrorMessage("Failed to load sales report.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentReport = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getPaymentReportApi({
        start_date: paymentStartDate || undefined,
        end_date: paymentEndDate || undefined,
        payment_method: paymentMethod || undefined,
        page: paymentPage,
        per_page: 10,
      });

      setPaymentReport(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to load payment report.",
        );
      } else {
        setErrorMessage("Failed to load payment report.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOutstandingReport = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getOutstandingInvoiceReportApi({
        status: outstandingStatus || undefined,
        page: outstandingPage,
        per_page: 10,
      });

      setOutstandingReport(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ??
            "Failed to load outstanding invoice report.",
        );
      } else {
        setErrorMessage("Failed to load outstanding invoice report.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "sales") {
      void fetchSalesReport();
      return;
    }

    if (activeTab === "payments") {
      void fetchPaymentReport();
      return;
    }

    void fetchOutstandingReport();
  }, [activeTab, salesPage, paymentPage, outstandingPage]);

  const handleSearch = () => {
    if (activeTab === "sales") {
      setSalesPage(1);
      void fetchSalesReport();
      return;
    }

    if (activeTab === "payments") {
      setPaymentPage(1);
      void fetchPaymentReport();
      return;
    }

    setOutstandingPage(1);
    void fetchOutstandingReport();
  };

  const handleClearFilters = () => {
    if (activeTab === "sales") {
      setSalesStartDate("");
      setSalesEndDate("");
      setSalesStatus("");
      setSalesPage(1);
      setTimeout(() => void fetchSalesReport(), 0);
      return;
    }

    if (activeTab === "payments") {
      setPaymentStartDate("");
      setPaymentEndDate("");
      setPaymentMethod("");
      setPaymentPage(1);
      setTimeout(() => void fetchPaymentReport(), 0);
      return;
    }

    setOutstandingStatus("");
    setOutstandingPage(1);
    setTimeout(() => void fetchOutstandingReport(), 0);
  };

  const handleExport = async () => {
    setErrorMessage("");
    setIsExporting(true);

    try {
      if (activeTab === "sales") {
        await exportSalesReportApi({
          start_date: salesStartDate || undefined,
          end_date: salesEndDate || undefined,
          status: salesStatus || undefined,
        });
        return;
      }

      if (activeTab === "payments") {
        await exportPaymentReportApi({
          start_date: paymentStartDate || undefined,
          end_date: paymentEndDate || undefined,
          payment_method: paymentMethod || undefined,
        });
        return;
      }

      await exportOutstandingInvoiceReportApi({
        status: outstandingStatus || undefined,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to export report.",
        );
      } else {
        setErrorMessage("Failed to export report.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const renderPagination = (
    currentPage: number,
    lastPage: number,
    onPageChange: (page: number) => void,
  ) => {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm text-slate-500">
          Page {currentPage} of {lastPage}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Analyze sales, payments, and outstanding invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleExport()}
          disabled={isExporting}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isExporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mb-4 rounded-xl bg-white p-2 shadow-sm">
        <div className="grid gap-2 md:grid-cols-3">
          <button
            type="button"
            onClick={() => setActiveTab("sales")}
            className={[
              "rounded-lg px-4 py-2.5 text-sm font-semibold",
              activeTab === "sales"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            Sales Report
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            className={[
              "rounded-lg px-4 py-2.5 text-sm font-semibold",
              activeTab === "payments"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            Payment Report
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("outstanding")}
            className={[
              "rounded-lg px-4 py-2.5 text-sm font-semibold",
              activeTab === "outstanding"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            Outstanding Invoices
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        {activeTab === "sales" && (
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto_auto]">
            <input
              type="date"
              value={salesStartDate}
              onChange={(event) => setSalesStartDate(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
            />

            <input
              type="date"
              value={salesEndDate}
              onChange={(event) => setSalesEndDate(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
            />

            <select
              value={salesStatus}
              onChange={(event) => setSalesStatus(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
            >
              {invoiceStatuses.map((status) => (
                <option key={status || "all"} value={status}>
                  {status ? formatStatus(status) : "All Status"}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSearch}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear
            </button>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto_auto]">
            <input
              type="date"
              value={paymentStartDate}
              onChange={(event) => setPaymentStartDate(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
            />

            <input
              type="date"
              value={paymentEndDate}
              onChange={(event) => setPaymentEndDate(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
            />

            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
            >
              {paymentMethods.map((method) => (
                <option key={method || "all"} value={method}>
                  {method ? formatStatus(method) : "All Methods"}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSearch}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear
            </button>
          </div>
        )}

        {activeTab === "outstanding" && (
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <select
              value={outstandingStatus}
              onChange={(event) => setOutstandingStatus(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
            >
              {outstandingStatuses.map((status) => (
                <option key={status || "all"} value={status}>
                  {status ? formatStatus(status) : "All Outstanding Status"}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSearch}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {activeTab === "sales" && salesReport && (
        <div>
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Invoices"
              value={salesReport.summary.total_invoices}
            />
            <SummaryCard
              title="Total Sales"
              value={formatCurrency(salesReport.summary.total_amount)}
            />
            <SummaryCard
              title="Total Paid"
              value={formatCurrency(salesReport.summary.total_paid)}
            />
            <SummaryCard
              title="Balance Due"
              value={formatCurrency(salesReport.summary.total_balance_due)}
            />
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Sales Report
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Invoice
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Issue Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Paid
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Balance
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        Loading sales report...
                      </td>
                    </tr>
                  ) : salesReport.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No sales report data found.
                      </td>
                    </tr>
                  ) : (
                    salesReport.data.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                          <Link
                            to={`/invoices/${invoice.id}`}
                            className="hover:underline"
                          >
                            {invoice.invoice_no}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {invoice.customer?.name ?? "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {formatStatus(invoice.status)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {formatDate(invoice.issue_date)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {formatDate(invoice.due_date)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-slate-900">
                          {formatCurrency(invoice.total_amount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-600">
                          {formatCurrency(invoice.paid_amount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-600">
                          {formatCurrency(invoice.balance_due)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">
                Showing {salesReport.meta.from ?? 0} to{" "}
                {salesReport.meta.to ?? 0} of {salesReport.meta.total} invoices
              </p>

              {renderPagination(
                salesReport.meta.current_page,
                salesReport.meta.last_page,
                setSalesPage,
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "payments" && paymentReport && (
        <div>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <SummaryCard
              title="Total Payments"
              value={paymentReport.summary.total_payments}
            />
            <SummaryCard
              title="Total Received"
              value={formatCurrency(paymentReport.summary.total_amount)}
            />
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Payment Report
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Invoice
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
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
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        Loading payment report...
                      </td>
                    </tr>
                  ) : paymentReport.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No payment report data found.
                      </td>
                    </tr>
                  ) : (
                    paymentReport.data.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                          {payment.payment_no}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {payment.invoice ? (
                            <Link
                              to={`/invoices/${payment.invoice.id}`}
                              className="font-medium text-slate-900 hover:underline"
                            >
                              {payment.invoice.invoice_no}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {payment.invoice?.customer?.name ?? "-"}
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">
                Showing {paymentReport.meta.from ?? 0} to{" "}
                {paymentReport.meta.to ?? 0} of {paymentReport.meta.total}{" "}
                payments
              </p>

              {renderPagination(
                paymentReport.meta.current_page,
                paymentReport.meta.last_page,
                setPaymentPage,
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "outstanding" && outstandingReport && (
        <div>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <SummaryCard
              title="Outstanding Invoices"
              value={outstandingReport.summary.total_invoices}
            />
            <SummaryCard
              title="Total Outstanding"
              value={formatCurrency(
                outstandingReport.summary.total_outstanding,
              )}
            />
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Outstanding Invoices
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Invoice
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Issue Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Paid
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Balance
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        Loading outstanding invoices...
                      </td>
                    </tr>
                  ) : outstandingReport.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No outstanding invoices found.
                      </td>
                    </tr>
                  ) : (
                    outstandingReport.data.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                          <Link
                            to={`/invoices/${invoice.id}`}
                            className="hover:underline"
                          >
                            {invoice.invoice_no}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {invoice.customer?.name ?? "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {formatStatus(invoice.status)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {formatDate(invoice.issue_date)}
                        </td>
                        <td
                          className={[
                            "whitespace-nowrap px-4 py-3 text-sm",
                            invoice.status === "OVERDUE"
                              ? "font-semibold text-red-700"
                              : "text-slate-600",
                          ].join(" ")}
                        >
                          {formatDate(invoice.due_date)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-slate-900">
                          {formatCurrency(invoice.total_amount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-600">
                          {formatCurrency(invoice.paid_amount)}
                        </td>
                        <td
                          className={[
                            "whitespace-nowrap px-4 py-3 text-right text-sm font-semibold",
                            invoice.status === "OVERDUE"
                              ? "text-red-700"
                              : "text-slate-900",
                          ].join(" ")}
                        >
                          {formatCurrency(invoice.balance_due)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">
                Showing {outstandingReport.meta.from ?? 0} to{" "}
                {outstandingReport.meta.to ?? 0} of{" "}
                {outstandingReport.meta.total} invoices
              </p>

              {renderPagination(
                outstandingReport.meta.current_page,
                outstandingReport.meta.last_page,
                setOutstandingPage,
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
