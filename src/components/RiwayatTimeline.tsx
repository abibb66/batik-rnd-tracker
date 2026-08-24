import type { RiwayatStatus, User } from "@/generated/prisma/client";

type RiwayatEntry = RiwayatStatus & { diubahOleh: User | null };

export function RiwayatTimeline({ riwayat }: { riwayat: RiwayatEntry[] }) {
  return (
    <ol className="space-y-3 border-l-2 border-indigo-100 pl-4 dark:border-indigo-950">
      {riwayat.map((r) => (
        <li key={r.id} className="text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {r.statusDari ? `${r.statusDari} → ${r.statusKe}` : `Dibuat: ${r.statusKe}`}
            </span>
            <span className="text-xs text-zinc-400">{r.divisi}</span>
            <span className="text-xs text-zinc-400">{r.timestamp.toLocaleString("id-ID")}</span>
          </div>
          {(r.diubahOleh || r.catatan) && (
            <p className="mt-0.5 text-zinc-500 dark:text-zinc-400">
              {r.diubahOleh?.nama}
              {r.diubahOleh && r.catatan ? " — " : ""}
              {r.catatan}
            </p>
          )}
        </li>
      ))}
      {riwayat.length === 0 && <li className="text-sm text-zinc-500 dark:text-zinc-400">Belum ada riwayat.</li>}
    </ol>
  );
}
