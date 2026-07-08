import type { RoleName } from "../features/auth/authType";

export function hasRole(
  roleName: string | null | undefined,
  allowedRoles: RoleName[],
): boolean {
  if (!roleName) {
    return false;
  }

  return allowedRoles.includes(roleName as RoleName);
}

export function canManageCustomers(roleName: string | null | undefined) {
  return hasRole(roleName, ["ADMIN", "SALES"]);
}

export function canManageProducts(roleName: string | null | undefined) {
  return hasRole(roleName, ["ADMIN", "SALES"]);
}

export function canManageQuotations(roleName: string | null | undefined) {
  return hasRole(roleName, ["ADMIN", "SALES"]);
}

export function canSendQuotation(roleName: string | null | undefined) {
  return hasRole(roleName, ["ADMIN", "SALES"]);
}

export function canConvertQuotation(roleName: string | null | undefined) {
  return hasRole(roleName, ["ADMIN", "SALES"]);
}

export function canManageInvoices(roleName: string | null | undefined) {
  return hasRole(roleName, ["ADMIN", "ACCOUNTANT"]);
}

export function canRecordPayment(roleName: string | null | undefined) {
  return hasRole(roleName, ["ADMIN", "ACCOUNTANT"]);
}

export function canDeletePayment(roleName: string | null | undefined) {
  return hasRole(roleName, ["ADMIN", "ACCOUNTANT"]);
}

export function canMarkOverdueInvoices(roleName: string | null | undefined) {
  return hasRole(roleName, ["ADMIN", "ACCOUNTANT"]);
}

export function canViewReports(roleName: string | null | undefined) {
  return hasRole(roleName, ["ADMIN", "ACCOUNTANT", "MANAGER"]);
}

export function canViewAuditLogs(roleName: string | null | undefined) {
  return hasRole(roleName, ["ADMIN", "MANAGER"]);
}
