<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()
            ->with(['creator:id,name', 'updater:id,name'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($query) use ($search) {
                $query->where('product_code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('unit', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type')->toString());
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $perPage = min($request->integer('per_page', 10), 50);

        $products = $query->paginate($perPage);

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $product = Product::create([
            ...$validated,
            'product_code' => $this->generateProductCode($validated['type']),
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);
        
        return response()->json([
            'message' => 'Product created successfully.',
            'product' => new ProductResource(
                $product->load(['creator:id,name', 'updater:id,name'])
            ),
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'product' => new ProductResource(
                $product->load(['creator:id,name', 'updater:id,name'])
            ),
        ]);
    }

    public function update(
        UpdateProductRequest $request,
        Product $product
    ): JsonResponse {
        $validated = $request->validated();

        $product->update([
            ...$validated,
            'is_active' => $validated['is_active'] ?? $product->is_active,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => new ProductResource(
                $product->load(['creator:id,name', 'updater:id,name']),
            ),
        ]);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $product->update([
            'updated_by' => $request->user()->id,
        ]);

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }

    private function generateProductCode(string $type): string
    {
        $prefix = $type === Product::TYPE_SERVICE ? 'SRV' : 'PRD';

        $nextNumber = Product::withTrashed()
            ->where('product_code', 'like', "{$prefix}-%")
            ->count() + 1;

        do {
            $productCode = $prefix.'-'.str_pad((string) $nextNumber, 6, '0', STR_PAD_LEFT);
            $nextNumber++;
        } while (
            Product::withTrashed()
                ->where('product_code', $productCode)
                ->exists()
        );

        return $productCode;
    }
}
