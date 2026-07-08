import { api } from "../../lib/api";
import type { PaginatedResponse } from "../../types/pagination";
import type { AuditLog, AuditLogListParams } from "./auditLogTypes";

export async function getAuditLogsApi(params: AuditLogListParams = {}) {
  return api.get<PaginatedResponse<AuditLog>>("/audit-logs", {
    params,
  });
}
