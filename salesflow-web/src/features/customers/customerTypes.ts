export interface CustomerUser {
  id: number;
  name: string;
}

export interface Customer {
  id: number;
  customer_code: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  tax_id: string | null;
  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_by?: CustomerUser;
  updated_by?: CustomerUser;
  created_at: string;
  updated_at: string;
}

export interface CustomerPayload {
  name: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  tax_id?: string | null;
  address?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  is_active?: boolean;
}

export interface CustomerResponse {
  message?: string;
  customer: Customer;
}

export interface CustomerListParams {
  search?: string;
  page?: number;
  per_page?: number;
  is_active?: boolean;
}
