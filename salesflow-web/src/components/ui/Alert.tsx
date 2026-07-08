interface AlertProps {
  type: "success" | "error" | "info";
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  const className =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : type === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <div
      className={["rounded-lg border px-5 py-4 text-sm", className].join(" ")}
    >
      {message}
    </div>
  );
}
