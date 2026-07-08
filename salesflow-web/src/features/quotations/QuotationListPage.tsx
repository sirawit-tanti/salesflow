import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatDate } from "../../lib/formatDate";
import { formatStatus } from "../../lib/formatStatus";
import type { PaginationMeta } from "../../types/pagination";
import { deleteQuotationApi, getQuotationsApi } from "./quotationApi";
import type { Quotation, QuotationStatus } from "./quotationTypes";
import { useAuth } from "../auth/AuthContext";
import { canManageQuotations } from "../../lib/permissions";

const quotationStatuses: Array<QuotationStatus | ""> = [
  "",
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CONVERTED",
];

function getStatusClass(status: QuotationStatus): string {
  if (status === "DRAFT") {
    return "bg-slate-100 text-slate-700";
  }

  if (status === "SENT") {
    return "bg-blue-50 text-blue-700";
  }

  if (status === "ACCEPTED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "REJECTED") {
    return "bg-red-50 text-red-700";
  }

  if (status === "EXPIRED") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-indigo-50 text-indigo-700";
}

export function QuotationListPage() {
  const { user } = useAuth();
  const canManage = canManageQuotations(user?.role?.name);

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | "">("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchQuotations = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getQuotationsApi({
        search,
        status: statusFilter,
        page,
        per_page: 10,
      });

      setQuotations(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to load quotations.",
        );
      } else {
        setErrorMessage("Failed to load quotations.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchQuotations();
  }, [search, statusFilter, page]);

  const handleDelete = async (quotation: Quotation) => {
    const confirmed = window.confirm(
      `Delete quotation ${quotation.quotation_no}?`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await deleteQuotationApi(quotation.id);

      setSuccessMessage(response.data.message);
      await fetchQuotations();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to delete quotations.",
        );
      } else {
        setErrorMessage("Failed to delete quotations.");
      }
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
          <h1 className="text-2xl font-bold text-slate-900">Quotations</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage customer quotations.
          </p>
        </div>

        {canManage && (
          <Link
            to="/quotations/create"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Create Quotation
          </Link>
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
          className="grid gap-3 md:grid-cols-[1fr_180px_auto_auto]"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by quotation no, customer name, email..."
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
          />

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as QuotationStatus | "");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
          >
            {quotationStatuses.map((status) => (
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
                  Quotation No
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
                  Expiry Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
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
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Loading quotations...
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No quotations found.
                  </td>
                </tr>
              ) : (
                quotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                      {quotation.quotation_no}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {quotation.customer?.name ?? "-"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {quotation.customer?.customer_code ?? "-"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          getStatusClass(quotation.status),
                        ].join(" ")}
                      >
                        {formatStatus(quotation.status)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {formatDate(quotation.issue_date)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {formatDate(quotation.expiry_date)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(quotation.total_amount)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/quotations/${quotation.id}`}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          View
                        </Link>

                        {quotation.status === "DRAFT" && (
                          <>
                            {canManage && (
                              <Link
                                to={`/quotations/${quotation.id}/edit`}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                              >
                                Edit
                              </Link>
                            )}

                            {canManage && (
                              <button
                                type="button"
                                onClick={() => void handleDelete(quotation)}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            )}
                          </>
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
              ? `Showing ${meta.from ?? 0} to ${meta.to ?? 0} of ${meta.total} quotations`
              : "Showing 0 quotations"}
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
