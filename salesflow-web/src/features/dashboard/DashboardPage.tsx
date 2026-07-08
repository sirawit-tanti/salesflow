import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatDate } from "../../lib/formatDate";
import { formatStatus } from "../../lib/formatStatus";
import { getDashboardSummaryApi } from "./dashboardApi";
import type { DashboardSummaryResponse } from "./dashboardTypes";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
}

function StatCard({ title, value, description }: StatCardProps) {
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

interface StatusCardProps {
  label: string;
  value: number;
}

function StatusCard({ label, value }: StatusCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardSummaryResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getDashboardSummaryApi();
        setDashboard(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(
            error.response?.data?.message ?? "Failed to load dashboard.",
          );
        } else {
          setErrorMessage("Failed to load dashboard.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (errorMessage || !dashboard) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

        <div className="mt4 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage || "Dashboard data not found."}
        </div>
      </div>
    );
  }

  const { summary, recent } = dashboard;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of quotations, invoices, payments, and receipts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/quotations/create"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Create Quotation
          </Link>

          <Link
            to="/invoices"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            View Invoices
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Customers"
          value={summary.customers.total}
          description={`${summary.customers.active} active customers`}
        />

        <StatCard
          title="Products & Services"
          value={summary.products.total}
          description={`${summary.products.product} products ${summary.products.service} services`}
        />

        <StatCard
          title="Quotations"
          value={summary.quotations.total}
          description={`${summary.quotations.draft} draft · ${summary.quotations.sent} sent`}
        />

        <StatCard
          title="Invoices"
          value={summary.invoices.total}
          description={`${summary.invoices.unpaid} unpaid · ${summary.invoices.paid} paid`}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Invoiced"
          value={formatCurrency(summary.revenue.total_invoiced)}
          description="Total invoice amount"
        />

        <StatCard
          title="Total Paid"
          value={formatCurrency(summary.revenue.total_paid)}
          description="Sum of invoice paid amount"
        />

        <StatCard
          title="Outstanding"
          value={formatCurrency(summary.revenue.outstanding_balance)}
          description="Remaining balance due"
        />

        <StatCard
          title="Payments Received"
          value={formatCurrency(summary.revenue.payment_received)}
          description="Sum from payment records"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Quotation Status
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Current quotation workflow summary.
              </p>
            </div>

            <Link
              to="/quotations"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            <StatusCard label="Draft" value={summary.quotations.draft} />
            <StatusCard label="Sent" value={summary.quotations.sent} />
            <StatusCard label="Accepted" value={summary.quotations.accepted} />
            <StatusCard label="Rejected" value={summary.quotations.rejected} />
            <StatusCard
              label="Converted"
              value={summary.quotations.converted}
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Invoice Status
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Payment status summary.
              </p>
            </div>

            <Link
              to="/invoices"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            <StatusCard label="Unpaid" value={summary.invoices.unpaid} />
            <StatusCard
              label="Partially Paid"
              value={summary.invoices.partially_paid}
            />
            <StatusCard label="Paid" value={summary.invoices.paid} />
            <StatusCard label="Overdue" value={summary.invoices.overdue} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Quotations
              </h2>
              <p className="mt-1 text-sm text-slate-500">Latest quotations.</p>
            </div>

            <Link
              to="/quotations"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              View
            </Link>
          </div>

          <div className="divide-y divide-slate-200">
            {recent.quotations.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-slate-500">
                No recent quotations.
              </p>
            ) : (
              recent.quotations.map((quotation) => (
                <Link
                  key={quotation.id}
                  to={`/quotations/${quotation.id}`}
                  className="block px-5 py-4 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {quotation.quotation_no}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {quotation.customer?.name ?? "-"}
                      </p>
                    </div>

                    <span className="text-xs font-medium text-slate-600">
                      {formatStatus(quotation.status)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{formatDate(quotation.issue_date)}</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(quotation.total_amount)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Invoices
              </h2>
              <p className="mt-1 text-sm text-slate-500">Latest invoices.</p>
            </div>

            <Link
              to="/invoices"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              View
            </Link>
          </div>

          <div className="divide-y divide-slate-200">
            {recent.invoices.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-slate-500">
                No recent invoices.
              </p>
            ) : (
              recent.invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  to={`/invoices/${invoice.id}`}
                  className="block px-5 py-4 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {invoice.invoice_no}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {invoice.customer?.name ?? "-"}
                      </p>
                    </div>

                    <span className="text-xs font-medium text-slate-600">
                      {formatStatus(invoice.status)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Due {formatDate(invoice.due_date)}</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(invoice.balance_due)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Payments
              </h2>
              <p className="mt-1 text-sm text-slate-500">Latest payments.</p>
            </div>

            <Link
              to="/receipts"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              Receipts
            </Link>
          </div>

          <div className="divide-y divide-slate-200">
            {recent.payments.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-slate-500">
                No recent payments.
              </p>
            ) : (
              recent.payments.map((payment) => (
                <Link
                  key={payment.id}
                  to={
                    payment.invoice
                      ? `/invoices/${payment.invoice.id}`
                      : "/invoices"
                  }
                  className="block px-5 py-4 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {payment.payment_no}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {payment.invoice?.customer?.name ?? "-"}
                      </p>
                    </div>

                    <span className="text-xs font-medium text-slate-600">
                      {formatStatus(payment.payment_method)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{formatDate(payment.payment_date)}</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
