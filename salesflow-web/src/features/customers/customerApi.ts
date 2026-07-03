import { api } from "../../lib/api";
import type { PaginatedResponse } from "../../types/pagination";
import type {
  Customer,
  CustomerListParams,
  CustomerPayload,
  CustomerResponse,
} from "./customerTypes";

export async function getCustomersApi(params: CustomerListParams = {}) {
  return api.get<PaginatedResponse<Customer>>("/customers", {
    params,
  });
}

export async function getCustomerApi(customerId: number) {
  return api.get<CustomerResponse>(`/customers/${customerId}`);
}
export async function createCustomerApi(payload: CustomerPayload) {
  return api.post<CustomerResponse>("/customers", payload);
}

export async function updateCustomerApi(
  customerId: number,
  payload: CustomerPayload,
) {
  return api.put<CustomerResponse>(`/customers/${customerId}`, payload);
}

export async function deleteCustomerApi(customerId: number) {
  return api.delete<{ message: string }>(`/customers/${customerId}`);
}
