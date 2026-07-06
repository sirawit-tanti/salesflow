<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quotations\StoreQuotationRequest;
use App\Http\Requests\Quotations\UpdateQuotationRequest;
use App\Http\Resources\QuotationResource;
use App\Models\Quotation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuotationController extends Controller
{
    public function index(Request $request)
    {
        $query = Quotation::query()
            ->with([
                'customer:id,customer_code,name,company_name,email,phone',
                'creator:id,name',
                'updater:id,name',
            ])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($query) use ($search) {
                $query->where('quotation_no', 'like', "%{$search}%")
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

        $quotations = $query->paginate($perPage);

        return QuotationResource::collection($quotations);
    }

    public function store(StoreQuotationRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $quotation = DB::transaction(function () use ($request, $validated) {
            $totals = $this->calculateTotals(
                $validated['items'],
                (float) ($validated['discount_amount'] ?? 0),
                (float) ($validated['tax_rate'] ?? 7)
            );

            $quotation = Quotation::create([
                'quotation_no' => $this->generateQuotationNo(),
                'customer_id' => $validated['customer_id'],
                'status' => Quotation::STATUS_DRAFT,
                'issue_date' => $validated['issue_date'],
                'expiry_date' => $validated['expiry_date'] ?? null,
                'sub_total' => $totals['sub_total'],
                'discount_amount' => $totals['discount_amount'],
                'tax_rate' => $totals['tax_rate'],
                'tax_amount' => $totals['tax_amount'],
                'total_amount' => $totals['total_amount'],
                'notes' => $validated['notes'] ?? null,
                'terms' => $validated['terms'] ?? null,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);

            $this->syncItems($quotation, $validated['items'], $totals['items']);

            return $quotation;
        });

        return response()->json([
            'message' => 'Quotation created successfully.',
            'quotation' => new QuotationResource(
                $quotation->load([
                    'customer',
                    'items.product',
                    'creator:id,name',
                    'updater:id,name',
                ])
            ),
        ], 201);
    }

    public function show(Quotation $quotation): JsonResponse
    {
        return response()->json([
            'quotation' => new QuotationResource(
                $quotation->load([
                    'customer',
                    'items.product',
                    'creator:id,name',
                    'updater:id,name',
                ])
            ),
        ]);
    }
    
    public function update(UpdateQuotationRequest $request, Quotation $quotation): JsonResponse
    {
        if ($quotation->status !== Quotation::STATUS_DRAFT) {
            return response()->json([
                'message' => 'Only draft quotations can be updated.',
            ], 422);
        }

        $validated = $request->validated();

        DB::transaction(function () use ($request, $validated, $quotation) {
            $totals = $this->calculateTotals(
                $validated['items'],
                (float) ($validated['discount_amount'] ?? 0),
                (float) ($validated['tax_rate'] ?? 7)
            );

            $quotation->update([
                'customer_id' => $validated['customer_id'],
                'issue_date' => $validated['issue_date'],
                'expiry_date' => $validated['expiry_date'] ?? null,
                'sub_total' => $totals['sub_total'],
                'discount_amount' => $totals['discount_amount'],
                'tax_rate' => $totals['tax_rate'],
                'tax_amount' => $totals['tax_amount'],
                'total_amount' => $totals['total_amount'],
                'notes' => $validated['notes'] ?? null,
                'terms' => $validated['terms'] ?? null,
                'updated_by' => $request->user()->id,
            ]);

            $quotation->items()->delete();

            $this->syncItems($quotation, $validated['items'], $totals['items']);
        });

        return response()->json([
            'message' => 'Quotation updated successfully.',
            'quotation' => new QuotationResource(
                $quotation->fresh()->load([
                    'customer',
                    'items.product',
                    'creator:id,name',
                    'updater:id,name',
                ])
            ),
        ]);
    }

    public function destroy(Quotation $quotation): JsonResponse
    {
        if ($quotation->status !== Quotation::STATUS_DRAFT) {
            return response()->json([
                'message' => 'Only draft quotations can be deleted.',
            ], 422);
        }

        $quotation->delete();

        return response()->json([
            'message' => 'Quotation deleted successfully.',
        ]);
    }

    private function calculateTotals(array $items, float $documentDiscountAmount, float $taxRate): array
    {
        $calculatedItems = [];
        $subTotal = 0;

        foreach ($items as $item) {
            $quantity = (float) $item['quantity'];
            $unitPrice = (float) $item['unit_price'];
            $itemDiscountAmount = (float) ($item['discount_amount'] ?? 0);

            $lineBeforeDiscount = $quantity * $unitPrice;
            $lineAfterDiscount = max($lineBeforeDiscount - $itemDiscountAmount, 0);

            $subTotal += $lineAfterDiscount;

            $calculatedItems[] = [
                'tax_amount' => 0,
                'line_total' => round($lineAfterDiscount, 2),
            ];
        }

        $discountAmount = min($documentDiscountAmount, $subTotal);
        $taxBase = max($subTotal - $discountAmount, 0);
        $taxAmount = round($taxBase * ($taxRate / 100), 2);
        $totalAmount = round($taxBase + $taxAmount, 2);

        return [
            'sub_total' => round($subTotal, 2),
            'discount_amount' => round($discountAmount, 2),
            'tax_rate' => round($taxRate, 2),
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
            'items' => $calculatedItems,
        ];
    }

    private function syncItems(Quotation $quotation, array $items, array $calculatedItems): void
    {
        foreach ($items as $index => $item) {
            $quotation->items()->create([
                'product_id' => $item['product_id'] ?? null,
                'item_name' => $item['item_name'],
                'description' => $item['description'] ?? null,
                'quantity' => $item['quantity'],
                'unit' => $item['unit'],
                'unit_price' => $item['unit_price'],
                'discount_amount' => $item['discount_amount'] ?? 0,
                'tax_amount' => $calculatedItems[$index]['tax_amount'],
                'line_total' => $calculatedItems[$index]['line_total'],
            ]);
        }
    }

    private function generateQuotationNo(): string
    {
        $year = now()->format('Y');

        $nextNumber = Quotation::withTrashed()
            ->where('quotation_no', 'like', "QT-{$year}-%")
            ->count() + 1;

        do {
            $quotationNo = 'QT-'.$year.'-'.str_pad((string) $nextNumber, 6, '0', STR_PAD_LEFT);
            $nextNumber++;
        } while (
            Quotation::withTrashed()
                ->where('quotation_no', $quotationNo)
                ->exists()
        );

        return $quotationNo;
    }
}