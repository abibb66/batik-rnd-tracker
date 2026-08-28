// Terpisah dari status.ts (yang server-only, query DB) supaya aman diimpor
// oleh client component seperti RndRow tanpa menyeret Prisma ke bundle browser.
export function statusBadgeClass(status: string) {
  switch (status) {
    case "REJECTED":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
    case "PO_KAIN":
    case "READY_STOK":
    case "READY_TO_LAUNCH":
    case "LAUNCH":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
    case "BELUM_MULAI":
      return "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400";
    case "REVISI_STRIKE_OFF":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
    default:
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300";
  }
}
