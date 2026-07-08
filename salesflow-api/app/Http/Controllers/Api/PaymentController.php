<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payments\StorePaymentRequest;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\ReceiptResource;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Receipt;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Invoice $invoice)
    {
        $payments = $invoice->payments()
            ->with(['creator:id,name', 'updater:id,name'])
            ->latest()
            ->get();

        return PaymentResource::collection($payments);
    }

    public function store(StorePaymentRequest $request, Invoice $invoice): JsonResponse
    {
        if (!in_array($invoice->status, [
            Invoice::STATUS_UNPAID,
            Invoice::STATUS_PARTIALLY_PAID,
            Invoice::STATUS_OVERDUE,
        ], true)) {
            return response()->json([
                'message' => 'Only unpaid or partially paid invoices can receive payments.'
            ], 422);
        }

        $validated = $request->validated();

        if ((float) $validated['amount'] > (float) $invoice->balance_due) {
            return response()->json([
                'message' => 'Payment amount cannot exceed invoice balance due.'
            ], 422);
        }

        $payment = DB::transaction(function () use ($request, $invoice, $validated) {
            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'payment_no' => $this->generatePaymentNo(),
                'payment_date' => $validated['payment_date'],
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'reference_no' => $validated['reference_no'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);

            Receipt::create([
                'receipt_no' => $this->generateReceiptNo(),
                'invoice_id' => $invoice->id,
                'payment_id' => $payment->id,
                'customer_id' => $invoice->customer_id,
                'receipt_date' => $validated['payment_date'],
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'reference_no' => $validated['reference_no'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);

            $this->recalculateInvoicePaymentStatus($invoice, $request->user()->id);

            return $payment;
        });
        
        app(AuditLogService::class)->log(
            request: $request,
            action: 'recorded',
            module: 'payments',
            auditable: $payment,
            description: "Recorded payment {$payment->payment_no} for invoice {$invoice->invoice_no}.",
            newValues: [
                'payment_no' => $payment->payment_no,
                'invoice_id' => $invoice->id,
                'invoice_no' => $invoice->invoice_no,
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
                'reference_no' => $payment->reference_no,
            ]
        );

        return response()->json([
            'message' => 'Payment recorded successfully.',
            'payment' => new PaymentResource(
                $payment->load(['invoice', 'receipt', 'creator:id,name', 'updater:id,name']),
            ),
            'receipt' => new ReceiptResource(
                $payment->receipt->load([
                    'invoice',
                    'payment',
                    'customer',
                    'creator:id,name',
                    'updater:id,name'
                ])
            ),
            'invoice' => new InvoiceResource(
                $invoice->fresh()->load([
                    'customer',
                    'quotation',
                    'items.product',
                    'payments.receipt',
                    'payments.creator:id,name',
                    'receipts',
                    'creator:id,name',
                    'updater:id,name',
                ]),
            ),
        ], 201);
    }

    public function destroy(Request $request, Invoice $invoice, Payment $payment): JsonResponse
    {
        if ($payment->invoice_id !== $invoice->id) {
            return response()->json([
                'message' => 'Payment does not belong to this invoice.',
            ], 404);
        }

        if ($invoice->status === Invoice::STATUS_CANCELLED) {
            return response()->json([
                'message' => 'Payments cannot be removed from cancelled invoices.',
            ], 422);
        }

        $oldValues = [
            'payment_no' => $payment->payment_no,
            'invoice_id' => $payment->invoice_id,
            'amount' => $payment->amount,
            'payment_method' => $payment->payment_method,
            'reference_no' => $payment->reference_no,
        ];

        DB::transaction(function () use ($request, $invoice, $payment) {
            $payment->update([
                'updated_by' => $request->user()->id,
            ]);

            $payment->delete();

            $this->recalculateInvoicePaymentStatus($invoice, $request->user()->id);
        });

        app(AuditLogService::class)->log(
            request: $request,
            action: 'deleted',
            module: 'payments',
            auditable: $payment,
            description: "Deleted payment {$oldValues['payment_no']} from invoice {$invoice->invoice_no}.",
            oldValues: $oldValues
        );

        return response()->json([
            'message' => 'Payment deleted successfully.',
            'invoice' => new InvoiceResource(
                $invoice->fresh()->load([
                    'customer',
                    'quotation',
                    'items.product',
                    'payments.receipt',
                    'payments.creator:id,name',
                    'receipts',
                    'creator:id,name',
                    'updater:id,name',
                ])
            ),
        ]);
    }

    private function recalculateInvoicePaymentStatus(Invoice $invoice, int $userId): void
    {
        $paidAmount = (float) $invoice->payments()->sum('amount');
        $totalAmount = (float) $invoice->total_amount;
        $balanceDue = max($totalAmount - $paidAmount, 0);

        if ($paidAmount <= 0) {
            $status = $this->isInvoicePastDue($invoice) 
                ? Invoice::STATUS_OVERDUE 
                : Invoice::STATUS_UNPAID;
        } else if ($balanceDue <= 0) {
            $status = Invoice::STATUS_PAID;
        } else {
            $status = $this->isInvoicePastDue($invoice) 
                ? Invoice::STATUS_OVERDUE 
                : Invoice::STATUS_PARTIALLY_PAID;
        }

        $invoice->update([
            'paid_amount' => round($paidAmount, 2),
            'balance_due' => round($balanceDue, 2),
            'status' => $status,
            'updated_by' => $userId,
        ]);
    }

    private function isInvoicePastDue(Invoice $invoice): bool
    {
        return $invoice->due_date !== null && $invoice->due_date->lt(now()->startOfDay());
    }

    private function generatePaymentNo(): string
    {
        $year = now()->format('Y');

        $nextNumber = Payment::withTrashed()
            ->where('payment_no', 'like', "PAY-{$year}-%")
            ->count() + 1;

        do {
            $paymentNo = 'PAY-'.$year.'-'.str_pad((string) $nextNumber, 6, '0', STR_PAD_LEFT);
            $nextNumber++;
        } while (
            Payment::withTrashed()
                ->where('payment_no', $paymentNo)
                ->exists()
        );

        return $paymentNo;
    }

    private function generateReceiptNo(): string
    {
        $year = now()->format('Y');

        $nextNumber = Receipt::withTrashed()
            ->where('receipt_no', 'like', "RCPT-{$year}-%")
            ->count() + 1;

        do {
            $receiptNo = 'RCPT-'.$year.'-'.str_pad((string) $nextNumber, 6, '0', STR_PAD_LEFT);
            $nextNumber++;
        } while (
            Receipt::withTrashed()
                ->where('receipt_no', $receiptNo)
                ->exists()
        );

        return $receiptNo;
    }
}