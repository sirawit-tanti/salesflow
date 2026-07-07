<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_id' => $this->invoice_id,
            'invoice' => $this->whenLoaded('invoice', function () {
                return [
                    'id' => $this->invoice->id,
                    'invoice_no' => $this->invoice->invoice_no,
                    'status' => $this->invoice->status,
                ];
            }),
            'payment_no' => $this->payment_no,
            'payment_date' => $this->payment_date?->toDateString(),
            'amount' => $this->amount,
            'payment_method' => $this->payment_method,
            'receipt' => $this->whenLoaded('receipt', function () {
                return [
                    'id' => $this->receipt->id,
                    'receipt_no' => $this->receipt->receipt_no,
                ];
            }),
            'reference_no' => $this->reference_no,
            'notes' => $this->notes,
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