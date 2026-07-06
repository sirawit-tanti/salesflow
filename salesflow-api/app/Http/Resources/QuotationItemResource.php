<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuotationItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product' => $this->whenLoaded('product', function () {
                return [
                    'id' => $this->product->id,
                    'product_code' => $this->product->product_code,
                    'name' => $this->product->name,
                    'type' => $this->product->type,
                ];
            }),
            'item_name' => $this->item_name,
            'description' => $this->description,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'unit_price' => $this->unit_price,
            'discount_amount' => $this->discount_amount,
            'tax_amount' => $this->tax_amount,
            'line_total' => $this->line_total,
            'created_at' => $this->created_at?->timezone('Asia/Bangkok')->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->timezone('Asia/Bangkok')->format('Y-m-d H:i:s'),
        ];
    }
}