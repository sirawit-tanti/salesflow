import { api } from "../../lib/api";
import type {
  LoginPayload,
  LoginResponse,
  LogoutResponse,
  MeResponse,
} from "./authType";

export async function loginApi(payload: LoginPayload) {
  return api.post<LoginResponse>("/auth/login", payload);
}

export async function getMeApi() {
  return api.get<MeResponse>("/auth/me");
}

export async function logoutApi() {
  return api.post<LogoutResponse>("/auth/logout");
}
