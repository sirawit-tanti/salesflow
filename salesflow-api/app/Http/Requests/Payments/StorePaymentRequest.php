<?php

namespace App\Http\Requests\Payments;

use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01|max:9999999999.99',
            'payment_method' => [
                'required',
                'string',
                Rule::in([
                    Payment::METHOD_CASH,
                    Payment::METHOD_BANK_TRANSFER,
                    Payment::METHOD_CREDIT_CARD,
                    Payment::METHOD_CHEQUE,
                    Payment::METHOD_OTHER,
                ]),
            ],
            'reference_no' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}