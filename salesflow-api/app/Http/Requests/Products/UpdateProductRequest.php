<?php

namespace App\Http\Requests\Products;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'type' => [
                'required',
                'string',
                Rule::in([
                    Product::TYPE_PRODUCT,
                    Product::TYPE_SERVICE,
                ]),
            ],
            'description' => 'nullable|string|max:1000',
            'unit' => 'required|string|max:50',
            'price' => 'required|numeric|min:0|max:9999999999.99',
            'is_active' => 'required|boolean',
        ];
    }
}
