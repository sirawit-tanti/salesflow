import { api } from "../../lib/api";
import type { PaginatedResponse } from "../../types/pagination";
import type { Product, ProductListParams, ProductPayload, ProductResponse } from "./productTypes";

export async function getProductsApi(params: ProductListParams = {}) {
    return api.get<PaginatedResponse<Product>>('/products', {
        params,
    });
}

export async function getProductApi(productId: number) {
    return api.get<ProductResponse>(`/products/${productId}`);
}

export async function createProductApi(payload: ProductPayload) {
    return api.post<ProductResponse>('/products', payload);
}

export async function updateProductApi(productId: number, payload: ProductPayload) {
    return api.put<ProductResponse>(`/products/${productId}`, payload);
}

export async function deleteProductApi(productId: number) {
    return api.delete<{ message: string }>(`/products/${productId}`);
}