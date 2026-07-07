<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::query()
            ->with([
                'customer:id,customer_code,name,company_name,email,phone',
                'quotation:id,quotation_no,status',
                'creator:id,name',
                'updater:id,name',
            ])
            ->latest();
        
        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($query) use ($search) {
                $query->where('invoice_no', 'like', "%{$search}%")
                    ->orWhereHas('quotation', function ($quotationQuery) use ($search) {
                        $quotationQuery->where('quotation_no', 'like', "%{$search}%");
                    })
                    ->orWhereHas('customer', function ($customerQuery) use ($search) {
                        $customerQuery->where('customer_code', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%")
                            ->orWhere('company_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->integer('customer_id'));
        }

        $perPage = min($request->integer('per_page', 10), 50);

        $invoices = $query->paginate($perPage);

        return InvoiceResource::collection($invoices);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        return response()->json([
            'invoice' => new InvoiceResource(
                $invoice->load([
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

    public function destroy(Request $request, Invoice $invoice): JsonResponse
    {
        if ($invoice->status !== Invoice::STATUS_UNPAID) {
            return response()->json([
                'message' => 'Only unpaid invoices can be deleted.',
            ], 422);
        }

        $invoice->update([
            'updated_by' => $request->user()->id,
        ]);

        $invoice->delete();

        return response()->json([
            'message' => 'Invoice deleted successfully.',
        ]);
    }
}