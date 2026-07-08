export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "DRAFT":
      return "bg-slate-100 text-slate-700 border-slate-200";

    case "SENT":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "ACCEPTED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200";

    case "CONVERTED":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "UNPAID":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "PARTIALLY_PAID":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "PAID":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "OVERDUE":
      return "bg-red-50 text-red-700 border-red-200";

    case "CANCELLED":
      return "bg-slate-100 text-slate-500 border-slate-200";

    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}
