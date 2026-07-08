<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $query = $this->buildSalesReportQuery($request);

        $invoices = $query
            ->latest()
            ->paginate(min($request->integer('per_page', 10), 50));

        $summaryQuery = $this->buildSalesReportQuery($request);

        return response()->json([
            'summary' => [
                'total_invoices' => (clone $summaryQuery)->count(),
                'total_amount' => (float) (clone $summaryQuery)->sum('total_amount'),
                'total_paid' => (float) (clone $summaryQuery)->sum('paid_amount'),
                'total_balance_due' => (float) (clone $summaryQuery)->sum('balance_due'),
            ],
            'data' => $invoices->items(),
            'meta' => [
                'current_page' => $invoices->currentPage(),
                'from' => $invoices->firstItem(),
                'last_page' => $invoices->lastPage(),
                'per_page' => $invoices->perPage(),
                'to' => $invoices->lastItem(),
                'total' => $invoices->total(),
            ]
        ]);
    }

    public function exportSales(Request $request): StreamedResponse
    {
        $invoices = $this->buildSalesReportQuery($request)
            ->latest()
            ->get();

        $filename = 'sales-report-'.now()->format('Ymd-His').'.csv';

        return $this->downloadCsv($filename, [
            'Invoice No',
            'Customer',
            'Status',
            'Issue Date',
            'Due Date',
            'Total Amount',
            'Paid Amount',
            'Balance Due',
        ], $invoices->map(function (Invoice $invoice) {
            return [
                $invoice->invoice_no,
                $invoice->customer?->name ?? '-',
                $invoice->status,
                $invoice->issue_date?->toDateString(),
                $invoice->due_date?->toDateString(),
                $invoice->total_amount,
                $invoice->paid_amount,
                $invoice->balance_due,
            ];
        })->all());
    }

    public function payments(Request $request)
    {
        $query = $this->buildPaymentReportQuery($request);

        $payments = $query
            ->latest()
            ->paginate(min($request->integer('per_page', 10), 50));

        $summaryQuery = $this->buildPaymentReportQuery($request);

        return response()->json([
            'summary' => [
                'total_payments' => (clone $summaryQuery)->count(),
                'total_amount' => (float) (clone $summaryQuery)->sum('amount'),
            ],
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'from' => $payments->firstItem(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'to' => $payments->lastItem(),
                'total' => $payments->total(),
            ],
        ]);
    }

    public function exportPayments(Request $request): StreamedResponse
    {
        $payments = $this->buildPaymentReportQuery($request)
            ->latest()
            ->get();

        $filename = 'payment-report-' . now()->format('Ymd-His') . '.csv';

        return $this->downloadCsv($filename, [
            'Payment No',
            'Invoice No',
            'Customer',
            'Payment Date',
            'Payment Method',
            'Reference No',
            'Amount',
        ], $payments->map(function (Payment $payment) {
            return [
                $payment->payment_no,
                $payment->invoice?->invoice_no ?? '-',
                $payment->invoice?->customer?->name ?? '-',
                $payment->payment_date?->toDateString(),
                $payment->payment_method,
                $payment->reference_no,
                $payment->amount,
            ];
        })->all());
    }

    public function outstandingInvoices(Request $request)
    {
        $query = $this->buildOutstandingInvoiceQuery($request);

        $invoices = $query
            ->latest()
            ->paginate(min($request->integer('per_page', 10), 50));

        $summaryQuery = $this->buildOutstandingInvoiceQuery($request);

        return response()->json([
            'summary' => [
                'total_invoices' => (clone $summaryQuery)->count(),
                'total_outstanding' => (float) (clone $summaryQuery)->sum('balance_due'),
            ],
            'data' => $invoices->items(),
            'meta' => [
                'current_page' => $invoices->currentPage(),
                'from' => $invoices->firstItem(),
                'last_page' => $invoices->lastPage(),
                'per_page' => $invoices->perPage(),
                'to' => $invoices->lastItem(),
                'total' => $invoices->total(),
            ],
        ]);
    }

    public function exportOutstandingInvoices(Request $request): StreamedResponse
    {
        $invoices = $this->buildOutstandingInvoiceQuery($request)
            ->latest()
            ->get();

        $filename = 'outstanding-invoices-' . now()->format('Ymd-His') . '.csv';

        return $this->downloadCsv($filename, [
            'Invoice No',
            'Customer',
            'Status',
            'Issue Date',
            'Due Date',
            'Total Amount',
            'Paid Amount',
            'Balance Due',
        ], $invoices->map(function (Invoice $invoice) {
            return [
                $invoice->invoice_no,
                $invoice->customer?->name ?? '-',
                $invoice->status,
                $invoice->issue_date?->toDateString(),
                $invoice->due_date?->toDateString(),
                $invoice->total_amount,
                $invoice->paid_amount,
                $invoice->balance_due,
            ];
        })->all());
    }

    private function buildSalesReportQuery(Request $request): Builder
    {
        return Invoice::query()
            ->with(['customer:id,customer_code,name,company_name,email,phone'])
            ->when($request->filled('start_date'), function (Builder $query) use ($request) {
                $query->whereDate('issue_date', '>=', $request->string('start_date')->toString());
            })
            ->when($request->filled('end_date'), function (Builder $query) use ($request) {
                $query->whereDate('issue_date', '<=', $request->string('end_date')->toString());
            })
            ->when($request->filled('status'), function (Builder $query) use ($request) {
                $query->where('status', $request->string('status')->toString());
            })
            ->when($request->filled('customer_id'), function (Builder $query) use ($request) {
                $query->where('customer_id', $request->integer('customer_id'));
            });
    }

    private function buildPaymentReportQuery(Request $request): Builder
    {
        return Payment::query()
            ->with([
                'invoice:id,invoice_no,customer_id,status,total_amount,paid_amount,balance_due',
                'invoice.customer:id,customer_code,name,company_name,email,phone',
            ])
            ->when($request->filled('start_date'), function (Builder $query) use ($request) {
                $query->whereDate('payment_date', '>=' , $request->string('start_date')->toString());
            })
            ->when($request->filled('end_date'), function (Builder $query) use ($request) {
                $query->whereDate('payment_date', '<=' , $request->string('end_date')->toString());
            })
            ->when($request->filled('payment_method'), function (Builder $query) use ($request) {
                $query->where('payment_method', $request->string('payment_method')->toString());
            })
            ->when($request->filled('customer_id'), function (Builder $query) use ($request) {
                $query->whereHas('invoice', function (Builder $invoiceQuery) use ($request) {
                    $invoiceQuery->where('customer_id', $request->integer('customer_id'));
                });
            });
    }

    private function buildOutstandingInvoiceQuery(Request $request): Builder
    {
        return Invoice::query()
            ->with([])
            ->where('balance_due', '>', 0)
            ->whereIn('status', [
                Invoice::STATUS_UNPAID,
                Invoice::STATUS_PARTIALLY_PAID,
                Invoice::STATUS_OVERDUE,
            ])
            ->when($request->filled('status'), function (Builder $query) use ($request) {
                $query->where('status', $request->string('status')->toString());
            })
            ->when($request->filled('customer_id'), function (Builder $query) use ($request) {
                $query->where('customer_id', $request->integer('customer_id'));
            });
    }

    private function downloadCsv(string $filename, array $headers, array $rows): StreamedResponse
    {
        return response()->streamDownload(function () use ($headers, $rows) {
            $file = fopen('php://output', 'w');

            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, $headers);

            foreach ($rows as $row) {
                fputcsv($file, $row);
            }

            fclose($file);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}