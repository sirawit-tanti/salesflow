<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customers\StoreCustomerRequest;
use App\Http\Requests\Customers\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Customer::query()
            ->with(['creator:id,name', 'updater:id,name'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($query) use ($search) {
                $query->where('customer_code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('tax_id', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $perPage = min($request->integer('per_page', 10), 50);

        $customers = $query->paginate($perPage);

        return CustomerResource::collection($customers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $customer = Customer::create([
            ...$validated,
            'customer_code' => $this->generateCustomerCode(),
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Customer created successfully.',
            'customer' => new CustomerResource(
                $customer->load(['creator:id,name', 'updater:id,name'])
            ),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer): JsonResponse
    {
        return response()->json([
            'customer' => new CustomerResource(
                $customer->load(['creator:id,name', 'updater:id,name'])
            ),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        $validated = $request->validated();

        $customer->update([
            ...$validated,
            'is_active' => $validated['is_active'] ?? $customer->is_active,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Customer updated successfully.',
            'customer' => new CustomerResource(
                $customer->load(['creator:id,name', 'updater:id,name']),
            )
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Customer $customer): JsonResponse
    {
        $customer->update([
            'updated_by' => $request->user()->id,
        ]);

        $customer->delete();

        return response()->json([
            'message' => 'Customer deleted successfully.'
        ]);
    }

    private function generateCustomerCode(): string
    {
        $nextNumber = Customer::withTrashed()->count() + 1;

        do {
            $customerCode = 'CUS-'.str_pad((string) $nextNumber, 6, '0', STR_PAD_LEFT);
            $nextNumber++;
        } while (
            Customer::withTrashed()
                ->where('customer_code', $customerCode)
                ->exists()
        );

        return $customerCode;
    }
}