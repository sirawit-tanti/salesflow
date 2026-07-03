export type RoleName = "ADMIN" | "SALES" | "ACCOUNTANT" | "MANAGER";

export interface Role {
  id: number;
  name: RoleName;
  display_name: string | null;
}

export interface User {
  id: number;
  role: Role;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface MeResponse {
  user: User;
}

export interface LogoutResponse {
  message: string;
}
