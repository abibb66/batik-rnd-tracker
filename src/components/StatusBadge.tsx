import { statusBadgeClass } from "@/lib/statusBadge";

export function StatusBadge({ label, status }: { label: string; status: string }) {
  return (
    <span
      className={`pill ${statusBadgeClass(status)}`}
    >
      {label}
    </span>
  );
}
