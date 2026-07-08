export interface AuditLogUser {
  id: number;
  name: string;
  email: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  user?: AuditLogUser;
  action: string;
  module: string;
  auditable_type: string | null;
  auditable_id: number | null;
  description: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogListParams {
  search?: string;
  module?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}
