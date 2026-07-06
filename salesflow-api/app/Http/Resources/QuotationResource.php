<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuotationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quotation_no' => $this->quotation_no,
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
            'expiry_date' => $this->expiry_date?->toDateString(),
            'sub_total' => $this->sub_total,
            'discount_amount' => $this->discount_amount,
            'tax_rate' => $this->tax_rate,
            'tax_amount' => $this->tax_amount,
            'total_amount' => $this->total_amount,
            'notes' => $this->notes,
            'terms' => $this->terms,
            'items' => QuotationItemResource::collection(
                $this->whenLoaded('items')
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
            'sent_at' => $this->sent_at?->timezone('Asia/Bangkok')->format('Y-m-d H:i:s'),
            'accepted_at' => $this->accepted_at?->timezone('Asia/Bangkok')->format('Y-m-d H:i:s'),
            'converted_at' => $this->converted_at?->timezone('Asia/Bangkok')->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->timezone('Asia/Bangkok')->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->timezone('Asia/Bangkok')->format('Y-m-d H:i:s'),
        ];
    }
}