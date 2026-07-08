import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatDate } from "../../lib/formatDate";
import type { PaginationMeta } from "../../types/pagination";
import { deleteProductApi, getProductsApi } from "./productApi";
import type { Product, ProductType } from "./productTypes";
import { useAuth } from "../auth/AuthContext";
import { canManageProducts } from "../../lib/permissions";

export function ProductListPage() {
  const { user } = useAuth();
  const canManage = canManageProducts(user?.role?.name);

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | "">("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchProducts = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getProductsApi({
        search,
        type: typeFilter,
        page,
        per_page: 10,
      });

      setProducts(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to load products",
        );
      } else {
        setErrorMessage("Failed to load products");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, [search, typeFilter, page]);

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete ${product.product_code} - ${product.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await deleteProductApi(product.id);

      setSuccessMessage(response.data.message);
      await fetchProducts();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to delete products",
        );
      } else {
        setErrorMessage("Failed to delete products");
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
          <h1 className="text-2xl font-bold text-slate-900">
            Products & Services
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage products and services for quotation items.
          </p>
        </div>

        {canManage && (
          <Link
            to="/products/create"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Create Product
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
            placeholder="Search by code, name, description, unit..."
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
          />

          <select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value as ProductType | "");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
          >
            <option value="">All Types</option>
            <option value="PRODUCT">Product</option>
            <option value="SERVICE">Service</option>
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
              setTypeFilter("");
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
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Unit
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Price
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
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No products or services found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                      {product.product_code}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {product.name}
                      </div>
                      <div className="max-w-xs truncate text-xs text-slate-500">
                        {product.description || "-"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={
                          product.type === "SERVICE"
                            ? "rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                            : "rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                        }
                      >
                        {product.type === "SERVICE" ? "Service" : "Product"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {product.unit}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-900">
                      {formatCurrency(product.price)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={
                          product.is_active
                            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                        }
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {formatDate(product.created_at)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        {canManage && (
                          <Link
                            to={`/products/${product.id}/edit`}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </Link>
                        )}

                        {canManage && (
                          <button
                            type="button"
                            onClick={() => void handleDelete(product)}
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
              ? `Showing ${meta.from ?? 0} to ${meta.to ?? 0} of ${meta.total} items`
              : "Showing 0 items"}
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
