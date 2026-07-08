import { formatStatus } from "../../lib/formatStatus";
import { getStatusBadgeClass } from "../../lib/statusBadge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        getStatusBadgeClass(status),
      ].join(" ")}
    >
      {formatStatus(status)}
    </span>
  );
}
