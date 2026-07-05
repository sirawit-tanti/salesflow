export type ProductType = 'PRODUCT' | 'SERVICE';

export interface ProductUser {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    product_code: string;
    name: string;
    type: ProductType;
    description: string | null;
    unit: string;
    price: string;
    is_active: boolean;
    created_by?: ProductUser;
    updated_by?: ProductUser;
    created_at: string;
    updated_at: string;
}

export interface ProductPayload {
    name: string;
    type: ProductType;
    description: string | null;
    unit: string;
    price: number;
    is_active?: boolean;
}

export interface ProductResponse {
    message?: string;
    product: Product;
}

export interface ProductListParams {
    search?: string;
    page?: number;
    per_page?: number;
    type?: ProductType | '';
    is_active?: boolean;
}