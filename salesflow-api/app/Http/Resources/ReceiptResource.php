<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'receipt_no' => $this->receipt_no,
            'invoice_id' => $this->invoice_id,
            'invoice' => $this->whenLoaded('invoice', function () {
                return [
                    'id' => $this->invoice->id,
                    'invoice_no' => $this->invoice->invoice_no,
                    'status' => $this->invoice->status,
                    'total_amount' => $this->invoice->total_amount,
                    'paid_amount' => $this->invoice->paid_amount,
                    'balance_due' => $this->invoice->balance_due,
                ];
            }),
            'payment_id' => $this->payment_id,
            'payment' => $this->whenLoaded('payment', function () {
                return [
                    'id' => $this->payment->id,
                    'payment_no' => $this->payment->payment_no,
                    'payment_date' => $this->payment->payment_date?->toDateString(),
                    'amount' => $this->payment->amount,
                    'payment_method' => $this->payment->payment_method,
                    'reference_no' => $this->payment->reference_no,
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
            'receipt_date' => $this->receipt_date?->toDateString(),
            'amount' => $this->amount,
            'payment_method' => $this->payment_method,
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