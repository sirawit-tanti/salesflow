import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatDate } from "../../lib/formatDate";
import { formatStatus } from "../../lib/formatStatus";
import { getQuotationApi } from "./quotationApi";
import type { Quotation } from "./quotationTypes";

export function QuotationDetailPage() {
  const { quotationId } = useParams();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!quotationId) {
      return;
    }

    const fetchQuotation = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getQuotationApi(Number(quotationId));
        setQuotation(response.data.quotation);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(
            error.response?.data?.message ?? "Failed to load quotation.",
          );
        } else {
          setErrorMessage("Failed to load quotation.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchQuotation();
  }, [quotationId]);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading quotation...</p>
      </div>
    );
  }

  if (errorMessage || !quotation) {
    return (
      <div>
        <Link
          to="/quotations"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to quotations
        </Link>

        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage || "Quotation not found."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            to="/quotations"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to quotations
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {quotation.quotation_no}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Quotation detail and items.
          </p>
        </div>

        {quotation.status === "DRAFT" && (
          <Link
            to={`/quotations/${quotation.id}/edit`}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Edit Quotation
          </Link>
        )}
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
                  {quotation.customer?.name ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Customer Code
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {quotation.customer?.customer_code ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Email
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {quotation.customer?.email ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Phone
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {quotation.customer?.phone ?? "-"}
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
                  {(quotation.items ?? []).map((item) => (
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

          {(quotation.notes || quotation.terms) && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
                <p className="mt-3 whitespace-pre-line text-sm text-slate-600">
                  {quotation.notes || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Terms</h2>
                <p className="mt-3 whitespace-pre-line text-sm text-slate-600">
                  {quotation.terms || "-"}
                </p>
              </div>
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
                  {formatStatus(quotation.status)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-500">Issue Date</dt>
                <dd className="font-medium text-slate-900">
                  {formatDate(quotation.issue_date)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-500">Expiry Date</dt>
                <dd className="font-medium text-slate-900">
                  {formatDate(quotation.expiry_date)}
                </dd>
              </div>

              <div className="border-t border-slate-200 pt-3" />

              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-medium text-slate-900">
                  {formatCurrency(quotation.sub_total)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-500">Discount</dt>
                <dd className="font-medium text-slate-900">
                  {formatCurrency(quotation.discount_amount)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-500">VAT {quotation.tax_rate}%</dt>
                <dd className="font-medium text-slate-900">
                  {formatCurrency(quotation.tax_amount)}
                </dd>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="font-bold text-slate-900">
                  {formatCurrency(quotation.total_amount)}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
