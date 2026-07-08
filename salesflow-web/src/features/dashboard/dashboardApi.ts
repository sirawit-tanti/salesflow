import { api } from "../../lib/api";
import type { DashboardSummaryResponse } from "./dashboardTypes";

export async function getDashboardSummaryApi() {
  return api.get<DashboardSummaryResponse>("/dashboard/summary");
}
