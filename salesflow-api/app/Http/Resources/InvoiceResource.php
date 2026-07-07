<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_no' => $this->invoice_no,
            'quotation_id' => $this->quotation_id,
            'quotation' => $this->whenLoaded('quotation', function () {
                return [
                    'id' => $this->quotation->id,
                    'quotation_no' => $this->quotation->quotation_no,
                    'status' => $this->quotation->status,
                ];
            }),
            'customer_id' => $this->customer_id,
            'customer' => $this->whenLoaded('customer', function () {
                return [
                    'id' => $this->customer->id,
                    'customer_code' => $this->customer->customer_code,
                    'name' => $this->customer->name,
                    'company_name' => $this->customer->company_name,
                    'email' => $this->customer->email,
                    'phone' => $this->customer->phone,
                    'tax_id' => $this->customer->tax_id,
                    'address' => $this->customer->address,
                ];
            }),
            'status' => $this->status,
            'issue_date' => $this->issue_date?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'sub_total' => $this->sub_total,
            'discount_amount' => $this->discount_amount,
            'tax_rate' => $this->tax_rate,
            'tax_amount' => $this->tax_amount,
            'total_amount' => $this->total_amount,
            'paid_amount' => $this->paid_amount,
            'balance_due' => $this->balance_due,
            'notes' => $this->notes,
            'items' => InvoiceItemResource::collection(
                $this->whenLoaded('items')
            ),
            'payments' => PaymentResource::collection(
                $this->whenLoaded('payments')
            ),
            'created_by' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'updated_by' => $this->whenLoaded('updater', function () {
                return [
                    'id' => $this->updater->id,
                    'name' => $this->updater->name,
                ];
            }),
            'created_at' => $this->created_at?->timezone('Asia/Bangkok')->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->timezone('Asia/Bangkok')->format('Y-m-d H:i:s'),
        ];
    }
}