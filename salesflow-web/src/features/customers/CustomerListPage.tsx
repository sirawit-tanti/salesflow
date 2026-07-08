import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { formatDate } from "../../lib/formatDate";
import type { PaginationMeta } from "../../types/pagination";
import { deleteCustomerApi, getCustomersApi } from "./customerApi";
import type { Customer } from "./customerTypes";
import { useAuth } from "../auth/AuthContext";
import { canManageCustomers } from "../../lib/permissions";

export function CustomerListPage() {
  const { user } = useAuth();
  const canManage = canManageCustomers(user?.role?.name);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchCustomers = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getCustomersApi({
        search,
        page,
        per_page: 10,
      });

      setCustomers(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to load customers.",
        );
      } else {
        setErrorMessage("Failed to load customers.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchCustomers();
  }, [search, page]);

  const handleDelete = async (customer: Customer) => {
    const confirmed = window.confirm(
      `Delete customer ${customer.customer_code} - ${customer.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await deleteCustomerApi(customer.id);

      setSuccessMessage(response.data.message);
      await fetchCustomers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to delete customer.",
        );
      } else {
        setErrorMessage("Failed to delete customer.");
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
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage customer records for quotations and invoices.
          </p>
        </div>

        {canManage && (
          <Link
            to="/customers/create"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Create Customer
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
          className="flex flex-col gap-3 md:flex-row"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by code, name, email, phone, tax ID..."
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
          />

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
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
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
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                      {customer.customer_code}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {customer.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {customer.company_name || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-700">
                        {customer.email || "-"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {customer.phone || "-"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={
                          customer.is_active
                            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                        }
                      >
                        {customer.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {formatDate(customer.created_at)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        {canManage && (
                          <Link
                            to={`/customers/${customer.id}/edit`}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </Link>
                        )}

                        {canManage && (
                          <button
                            type="button"
                            onClick={() => void handleDelete(customer)}
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
              ? `Showing ${meta.from ?? 0} to ${meta.to ?? 0} of ${meta.total} customers`
              : "Showing 0 customers"}
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
