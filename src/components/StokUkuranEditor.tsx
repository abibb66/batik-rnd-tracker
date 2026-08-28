"use client";

import { useActionState, useRef } from "react";
import { setStokUkuran, hapusStokUkuran, type StokUkuranState } from "@/app/warehouse/actions";
import type { StokUkuran } from "@/generated/prisma/client";

const initialState: StokUkuranState = {};

function BarisStok({ produkId, ukuran, jumlah }: { produkId: string; ukuran: string; jumlah: number }) {
  const [setState, setAction, setPending] = useActionState(setStokUkuran, initialState);
  const [hapusState, hapusAction] = useActionState(hapusStokUkuran, initialState);
  const error = setState.error || hapusState.error;

  return (
    <div className="flex items-center gap-2">
      <form action={setAction} className="flex flex-1 items-center gap-2">
        <input type="hidden" name="produkId" value={produkId} />
        <input type="hidden" name="ukuran" value={ukuran} />
        <span className="w-16 shrink-0 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{ukuran}</span>
        <input type="number" name="jumlah" min={0} defaultValue={jumlah} className="input w-24" />
        <button
          type="submit"
          disabled={setPending}
          className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Simpan
        </button>
      </form>
      <form action={hapusAction}>
        <input type="hidden" name="produkId" value={produkId} />
        <input type="hidden" name="ukuran" value={ukuran} />
        <button
          type="submit"
          title="Hapus ukuran ini"
          className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
        >
          Hapus
        </button>
      </form>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}

function TambahUkuran({ produkId }: { produkId: string }) {
  const [state, formAction, pending] = useActionState(setStokUkuran, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        formRef.current?.reset();
      }}
      className="flex items-center gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800"
    >
      <input type="hidden" name="produkId" value={produkId} />
      <input name="ukuran" placeholder="Ukuran baru, mis. 3XL" required className="input w-32" />
      <input type="number" name="jumlah" min={0} defaultValue={0} className="input w-24" />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        {pending ? "Menambah..." : "Tambah Ukuran"}
      </button>
      {state.error && <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}

export function StokUkuranEditor({ produkId, stokUkuran }: { produkId: string; stokUkuran: StokUkuran[] }) {
  const sorted = [...stokUkuran].sort((a, b) => a.urutan - b.urutan);
  const total = sorted.reduce((sum, s) => sum + s.jumlah, 0);

  return (
    <div className="space-y-2.5">
      {sorted.map((s) => (
        <BarisStok key={s.id} produkId={produkId} ukuran={s.ukuran} jumlah={s.jumlah} />
      ))}
      {sorted.length === 0 && <p className="text-sm text-zinc-500 dark:text-zinc-400">Belum ada data ukuran.</p>}
      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total stok: {total}</p>
      <TambahUkuran produkId={produkId} />
    </div>
  );
}
