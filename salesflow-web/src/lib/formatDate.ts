export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}
