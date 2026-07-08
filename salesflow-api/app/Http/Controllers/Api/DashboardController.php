<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Quotation;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function summary(): JsonResponse
    {
        $quotationSummary = [
            'total' => Quotation::count(),
            'draft' => Quotation::where('status', Quotation::STATUS_DRAFT)->count(),
            'sent' => Quotation::where('status', Quotation::STATUS_SENT)->count(),
            'accepted' => Quotation::where('status', Quotation::STATUS_ACCEPTED)->count(),
            'rejected' => Quotation::where('status', Quotation::STATUS_REJECTED)->count(),
            'converted' => Quotation::where('status', Quotation::STATUS_CONVERTED)->count(),
        ];

        $invoiceSummary = [
            'total' => Invoice::count(),
            'unpaid' => Invoice::where('status', Invoice::STATUS_UNPAID)->count(),
            'partially_paid' => Invoice::where('status', Invoice::STATUS_PARTIALLY_PAID)->count(),
            'paid' => Invoice::where('status', Invoice::STATUS_PAID)->count(),
            'overdue' => Invoice::where('status', Invoice::STATUS_OVERDUE)->count(),
        ];

        $revenueSummary = [
            'total_invoiced' => (float) Invoice::sum('total_amount'),
            'total_paid' => (float) Invoice::sum('paid_amount'),
            'outstanding_balance' => (float) Invoice::sum('balance_due'),
            'payment_received' => (float) Payment::sum('amount'),
        ];

        $recentQuotations = Quotation::query()
            ->with(['customer:id,customer_code,name,company_name'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function (Quotation $quotation) {
                return [
                    'id' => $quotation->id,
                    'quotation_no' => $quotation->quotation_no,
                    'customer' => $quotation->customer ? [
                        'id' => $quotation->customer->id,
                        'customer_code' => $quotation->customer->customer_code,
                        'name' => $quotation->customer->name,
                        'company_name' => $quotation->customer->company_name,
                    ] : null,
                    'status' => $quotation->status,
                    'issue_date' => $quotation->issue_date?->toDateString(),
                    'total_amount' => $quotation->total_amount,
                    'created_at' => $quotation->created_at?->timezone('Asia/Bangkok')->format('Y-m-d H:i:s'),
                ];
            });

        $recentInvoices = Invoice::query()
            ->with(['customer:id,customer_code,name,company_name'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function (Invoice $invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_no' => $invoice->invoice_no,
                    'customer' => $invoice->customer ? [
                        'id' => $invoice->customer->id,
                        'customer_code' => $invoice->customer->customer_code,
                        'name' => $invoice->customer->name,
                        'company_name' => $invoice->customer->company_name,
                    ] : null,
                    'status' => $invoice->status,
                    'issue_date' => $invoice->issue_date?->toDateString(),
                    'due_date' => $invoice->due_date?->toDateString(),
                    'total_amount' => $invoice->total_amount,
                    'paid_amount' => $invoice->paid_amount,
                    'balance_due' => $invoice->balance_due,
                    'created_at' => $invoice->created_at?->timezone('Asia/Bangkok')->format('Y-m-d H:i:s'),
                ];
            });

        $recentPayments = Payment::query()
            ->with([
                'invoice:id,invoice_no,status',
                'invoice.customer:id,customer_code,name,company_name',
            ])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function (Payment $payment) {
                return [
                    'id' => $payment->id,
                    'payment_no' => $payment->payment_no,
                    'payment_date' => $payment->payment_date?->toDateString(),
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'invoice' => $payment->invoice ? [
                        'id' => $payment->invoice->id,
                        'invoice_no' => $payment->invoice->invoice_no,
                        'status' => $payment->invoice->status,
                        'customer' => $payment->invoice->customer ? [
                            'id' => $payment->invoice->customer->id,
                            'customer_code' => $payment->invoice->customer->customer_code,
                            'name' => $payment->invoice->customer->name,
                            'company_name' => $payment->invoice->customer->company_name,
                        ] : null,
                    ] : null,
                    'created_at' => $payment->created_at?->timezone('Asia/Bangkok')->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json([
            'summary' => [
                'customers' => [
                    'total' => Customer::count(),
                    'active' => Customer::where('is_active', true)->count(),
                ],
                'products' => [
                    'total' => Product::count(),
                    'active' => Product::where('is_active', true)->count(),
                    'product' => Product::where('type', Product::TYPE_PRODUCT)->count(),
                    'service' => Product::where('type', Product::TYPE_SERVICE)->count(),
                ],
                'quotations' => $quotationSummary,
                'invoices' => $invoiceSummary,
                'revenue' => $revenueSummary,
            ],
            'recent' => [
                'quotations' => $recentQuotations,
                'invoices' => $recentInvoices,
                'payments' => $recentPayments,
            ],
        ]);
    }
}