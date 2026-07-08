import axios from "axios";
import { useEffect, useState } from "react";
import { formatStatus } from "../../lib/formatStatus";
import type { PaginationMeta } from "../../types/pagination";
import { getAuditLogsApi } from "./auditLogApi";
import type { AuditLog } from "./auditLogTypes";

const modules = [
  "",
  "quotations",
  "invoices",
  "payments",
  "customers",
  "products",
];

const actions = [
  "",
  "created",
  "sent",
  "accepted",
  "rejected",
  "converted",
  "created_from_quotation",
  "recorded",
  "deleted",
  "marked_overdue",
];

function formatAuditableType(value: string | null): string {
  if (!value) {
    return "-";
  }

  const parts = value.split("\\");

  return parts[parts.length - 1] ?? value;
}

function formatJsonValue(value: Record<string, unknown> | null): string {
  if (!value || Object.keys(value).length === 0) {
    return "-";
  }

  return JSON.stringify(value, null, 2);
}

interface AuditLogDetailModalProps {
  auditLog: AuditLog;
  onClose: () => void;
}

function AuditLogDetailModal({ auditLog, onClose }: AuditLogDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Audit Log Detail
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {auditLog.description ?? "-"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                User
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {auditLog.user?.name ?? "System"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {auditLog.user?.email ?? "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {auditLog.created_at}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                IP: {auditLog.ip_address ?? "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {formatStatus(auditLog.action)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Module
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {formatStatus(auditLog.module)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Auditable Type
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {formatAuditableType(auditLog.auditable_type)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Auditable ID
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {auditLog.auditable_id ?? "-"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                Old Values
              </h3>

              <pre className="max-h-80 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                {formatJsonValue(auditLog.old_values)}
              </pre>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                New Values
              </h3>

              <pre className="max-h-80 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                {formatJsonValue(auditLog.new_values)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuditLogListPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getAuditLogsApi({
        search: search || undefined,
        module: moduleFilter || undefined,
        action: actionFilter || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page,
        per_page: 10,
      });

      setAuditLogs(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to load audit logs.",
        );
      } else {
        setErrorMessage("Failed to load audit logs.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchAuditLogs();
  }, [search, moduleFilter, actionFilter, startDate, endDate, page]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearch("");
    setModuleFilter("");
    setActionFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track important actions performed in the system.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto_auto]">
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search action, module, description, user..."
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
          />

          <select
            value={moduleFilter}
            onChange={(event) => {
              setPage(1);
              setModuleFilter(event.target.value);
            }}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
          >
            {modules.map((module) => (
              <option key={module || "all"} value={module}>
                {module ? formatStatus(module) : "All Modules"}
              </option>
            ))}
          </select>

          <select
            value={actionFilter}
            onChange={(event) => {
              setPage(1);
              setActionFilter(event.target.value);
            }}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
          >
            {actions.map((action) => (
              <option key={action || "all"} value={action}>
                {action ? formatStatus(action) : "All Actions"}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(event) => {
              setPage(1);
              setStartDate(event.target.value);
            }}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
          />

          <input
            type="date"
            value={endDate}
            onChange={(event) => {
              setPage(1);
              setEndDate(event.target.value);
            }}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
          />

          <button
            type="button"
            onClick={handleSearch}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Search
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Module
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Details
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Loading audit logs...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                auditLogs.map((auditLog) => (
                  <tr key={auditLog.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {auditLog.created_at}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {auditLog.user?.name ?? "System"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {auditLog.user?.email ?? "-"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {formatStatus(auditLog.module)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {formatStatus(auditLog.action)}
                    </td>

                    <td className="min-w-[320px] px-4 py-3 text-sm text-slate-600">
                      {auditLog.description ?? "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <button
                        type="button"
                        onClick={() => setSelectedAuditLog(auditLog)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        View
                      </button>
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
              ? `Showing ${meta.from ?? 0} to ${meta.to ?? 0} of ${meta.total} audit logs`
              : "Showing 0 audit logs"}
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

      {selectedAuditLog && (
        <AuditLogDetailModal
          auditLog={selectedAuditLog}
          onClose={() => setSelectedAuditLog(null)}
        />
      )}
    </div>
  );
}
