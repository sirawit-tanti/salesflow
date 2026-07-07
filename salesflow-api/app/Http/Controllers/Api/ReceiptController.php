<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReceiptResource;
use App\Models\Receipt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Receipt::query()
            ->with([
                'invoice:id,invoice_no,status,total_amount,paid_amount,balance_due',
                'payment:id,payment_no,payment_date,amount,payment_method,reference_no',
                'customer:id,customer_code,name,company_name,email,phone',
                'creator:id,name',
                'updater:id,name',
            ])
            ->latest();

        if ($request->filled('saerch')) {
            $search = $request->string('search')->toString();

            $query->where(function ($query) use ($search) {
                $query->where('receipt_no', 'like', "%{$search}%")
                    ->orWhereHas('invoice', function ($invoiceQuery) use ($search) {
                        $invoiceQuery->where('invoice_no', 'like', "%{$search}%");
                    })
                    ->orWhereHas('payment', function ($paymentQuery) use ($search) {
                        $paymentQuery->where('payment_no', 'like', "%{$search}%")
                            ->orWhere('reference_no', 'like', "%{$search}%");
                    })
                    ->orWhereHas('customer', function ($customerQuery) use ($search) {
                        $customerQuery->where('customer_code', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%")
                            ->orWhere('company_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->integer('customer_id'));
        }

        if ($request->filled('invoice_id')) {
            $query->where('invoice_id', $request->integer('invoice_id'));
        }

        $perPage = min($request->integer('per_page', 10), 50);

        $receipts = $query->paginate($perPage);

        return ReceiptResource::collection($receipts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Receipt $receipt): JsonResponse
    {
        return response()->json([
            'receipt' => new ReceiptResource(
                $receipt->load([
                    'invoice',
                    'payment',
                    'customer',
                    'creator:id,name',
                    'updater:id,name',
                ])
            ),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}