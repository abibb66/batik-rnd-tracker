"use client";

import { useActionState } from "react";
import {
  renameDropdownOption,
  reorderDropdownOption,
  toggleDropdownOptionActive,
  deleteDropdownOption,
  type OpsiState,
} from "@/app/admin/opsi/actions";

const initialState: OpsiState = {};

export function OpsiRow({
  id,
  nilai,
  label,
  aktif,
  isFirst,
  isLast,
}: {
  id: string;
  nilai: string;
  label: string;
  aktif: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [renameState, renameAction, renamePending] = useActionState(renameDropdownOption, initialState);
  const [reorderState, reorderAction] = useActionState(reorderDropdownOption, initialState);
  const [toggleState, toggleAction] = useActionState(toggleDropdownOptionActive, initialState);
  const [deleteState, deleteAction] = useActionState(deleteDropdownOption, initialState);

  const error = renameState.error || reorderState.error || toggleState.error || deleteState.error;

  return (
    <div className={`border-t border-zinc-200 px-3 py-2 dark:border-zinc-800 ${aktif ? "" : "opacity-50"}`}>
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <form action={reorderAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="arah" value="naik" />
            <button
              type="submit"
              disabled={isFirst}
              aria-label="Naik"
              className="block text-xs text-zinc-400 hover:text-zinc-900 disabled:opacity-30 dark:hover:text-zinc-50"
            >
              ▲
            </button>
          </form>
          <form action={reorderAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="arah" value="turun" />
            <button
              type="submit"
              disabled={isLast}
              aria-label="Turun"
              className="block text-xs text-zinc-400 hover:text-zinc-900 disabled:opacity-30 dark:hover:text-zinc-50"
            >
              ▼
            </button>
          </form>
        </div>

        <div className="flex flex-1 items-center gap-2">
          <form action={renameAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={id} />
            <input name="label" defaultValue={label} required className="input" />
            <button
              type="submit"
              disabled={renamePending}
              className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Simpan
            </button>
          </form>
          <span className="text-xs text-zinc-400 dark:text-zinc-600">({nilai})</span>
          {!aktif && (
            <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Nonaktif
            </span>
          )}
        </div>

        <form action={toggleAction}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {aktif ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </form>

        <form action={deleteAction}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            disabled={aktif}
            title={aktif ? "Nonaktifkan dulu sebelum menghapus" : "Hapus permanen"}
            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-30 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            Hapus
          </button>
        </form>
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
