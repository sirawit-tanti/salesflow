import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatDate } from "../../lib/formatDate";
import { formatStatus } from "../../lib/formatStatus";
import type { PaginationMeta } from "../../types/pagination";
import {
  deleteInvoiceApi,
  getInvoicesApi,
  markOverdueInvoicesApi,
} from "./invoiceApi";
import type { Invoice, InvoiceStatus } from "./invoiceTypes";
import { useAuth } from "../auth/AuthContext";
import {
  canManageInvoices,
  canMarkOverdueInvoices,
} from "../../lib/permissions";

const invoiceStatuses: Array<InvoiceStatus | ""> = [
  "",
  "UNPAID",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

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

export function InvoiceListPage() {
  const { user } = useAuth();

  const canManage = canManageInvoices(user?.role?.name);
  const canMarkOverdue = canMarkOverdueInvoices(user?.role?.name);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchInvoices = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getInvoicesApi({
        search,
        status: statusFilter,
        page,
        per_page: 10,
      });

      setInvoices(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to load invoices.",
        );
      } else {
        setErrorMessage("Failed to load invoices.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchInvoices();
  }, [search, statusFilter, page]);

  const handleDelete = async (invoice: Invoice) => {
    const confirmed = window.confirm(`Delete invoice ${invoice.invoice_no}?`);

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await deleteInvoiceApi(invoice.id);

      setSuccessMessage(response.data.message);
      await fetchInvoices();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to delete invoice.",
        );
      } else {
        setErrorMessage("Failed to delete invoice.");
      }
    }
  };

  const handleMarkOverdue = async () => {
    const confirmed = window.confirm(
      "Mark all past-due unpaid invoices as overdue?",
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsActionLoading(true);

    try {
      const response = await markOverdueInvoicesApi();

      setSuccessMessage(
        `${response.data.message} Updated ${response.data.updated_count} invoice(s).`,
      );

      setPage(1);
      await fetchInvoices();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to mark overdue invoices.",
        );
      } else {
        setErrorMessage("Failed to mark overdue invoices.");
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const goToPreviousPage = () => {
    if (!meta || meta.current_page <= 1) {
      return;
    }

    setPage(meta.current_page - 1);
  };

  const goToNextPage = () => {
    if (!meta || meta.current_page >= meta.last_page) {
      return;
    }

    setPage(meta.current_page + 1);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="mt-1 text-sm text-slate-500">
            View invoices generated from accepted quotations.
          </p>
        </div>

        {canMarkOverdue && (
          <button
            type="button"
            onClick={() => void handleMarkOverdue()}
            disabled={isActionLoading}
            className="inline-flex items-center justify-center rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isActionLoading ? "Checking..." : "Mark Overdue"}
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(searchInput);
          }}
          className="grid gap-3 md:grid-cols-[1fr_200px_auto_auto]"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by invoice no, quotation no, customer..."
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
          />

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as InvoiceStatus | "");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
          >
            {invoiceStatuses.map((status) => (
              <option key={status || "ALL"} value={status}>
                {status ? formatStatus(status) : "All Statuses"}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setStatusFilter("");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Clear
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Invoice No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quotation
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
                  Balance
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                      {invoice.invoice_no}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {invoice.customer?.name ?? "-"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {invoice.customer?.customer_code ?? "-"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {invoice.quotation?.quotation_no ?? "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          getStatusClass(invoice.status),
                        ].join(" ")}
                      >
                        {formatStatus(invoice.status)}
                      </span>
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

                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/invoices/${invoice.id}`}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          View
                        </Link>

                        {invoice.status === "UNPAID" && canManage && (
                          <button
                            type="button"
                            onClick={() => void handleDelete(invoice)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
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

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            {meta
              ? `Showing ${meta.from ?? 0} to ${meta.to ?? 0} of ${meta.total} invoices`
              : "Showing 0 invoices"}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={!meta || meta.current_page <= 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-slate-500">
              Page {meta?.current_page ?? 1} of {meta?.last_page ?? 1}
            </span>

            <button
              type="button"
              onClick={goToNextPage}
              disabled={!meta || meta.current_page >= meta.last_page}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
