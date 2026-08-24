import { statusBadgeClass } from "@/lib/status";

export function StatusBadge({ label, status }: { label: string; status: string }) {
  return (
    <span
      className={`pill ${statusBadgeClass(status)}`}
    >
      {label}
    </span>
  );
}
