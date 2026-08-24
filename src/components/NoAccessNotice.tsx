import { DIVISI_LABEL } from "@/lib/status";
import type { Divisi } from "@/generated/prisma/client";

export function NoAccessNotice({ divisi }: { divisi: Divisi }) {
  return (
    <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
      {divisi === "ADMIN"
        ? "Hanya Admin yang bisa mengubah data ini."
        : `Hanya PIC ${DIVISI_LABEL[divisi]} atau Admin yang bisa mengubah data ini.`}
    </p>
  );
}
