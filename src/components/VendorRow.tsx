"use client";

import { useActionState } from "react";
import { updateVendor, toggleVendorActive, type VendorState } from "@/app/admin/vendor/actions";

const initialState: VendorState = {};

export function VendorRow({
  id,
  nama,
  leadTimeHari,
  aktif,
}: {
  id: string;
  nama: string;
  leadTimeHari: number;
  aktif: boolean;
}) {
  const [updateState, updateAction, updatePending] = useActionState(updateVendor, initialState);
  const [toggleState, toggleAction] = useActionState(toggleVendorActive, initialState);

  const error = updateState.error || toggleState.error;

  return (
    <div className={`border-t border-zinc-200 px-3 py-2.5 dark:border-zinc-800 ${aktif ? "" : "opacity-50"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <form action={updateAction} className="flex flex-1 flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <input name="nama" defaultValue={nama} required className="input flex-1 min-w-[140px]" />
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              name="leadTimeHari"
              defaultValue={leadTimeHari}
              min={0}
              required
              className="input w-20"
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">hari</span>
          </div>
          <button
            type="submit"
            disabled={updatePending}
            className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Simpan
          </button>
        </form>

        {!aktif && (
          <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Nonaktif
          </span>
        )}

        <form action={toggleAction}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {aktif ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </form>
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
