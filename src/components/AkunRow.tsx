"use client";

import { useActionState } from "react";
import {
  updateUserAkses,
  resetUserPassword,
  toggleUserActive,
  type AkunState,
} from "@/app/admin/akun/actions";

const initialState: AkunState = {};

const DIVISI_OPTIONS = [
  { value: "RND", label: "RnD" },
  { value: "PPIC", label: "PPIC" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "MARKETING", label: "Marketing" },
  { value: "ADMIN", label: "Admin" },
  { value: "VISITOR", label: "Visitor (lihat saja, tidak bisa edit)" },
] as const;

export function AkunRow({
  id,
  nama,
  email,
  divisi,
  aktif,
  isSelf,
}: {
  id: string;
  nama: string;
  email: string;
  divisi: string;
  aktif: boolean;
  isSelf: boolean;
}) {
  const [aksesState, aksesAction, aksesPending] = useActionState(updateUserAkses, initialState);
  const [passwordState, passwordAction, passwordPending] = useActionState(resetUserPassword, initialState);
  const [toggleState, toggleAction] = useActionState(toggleUserActive, initialState);

  const error = aksesState.error || passwordState.error || toggleState.error;

  return (
    <div className={`border-t border-zinc-200 px-3 py-3 dark:border-zinc-800 ${aktif ? "" : "opacity-50"}`}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-zinc-900 dark:text-zinc-50">{nama}</span>
        <span className="text-xs text-zinc-400 dark:text-zinc-600">{email}</span>
        {isSelf && (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            Kamu
          </span>
        )}
        {!aktif && (
          <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Nonaktif
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-end gap-2">
        <form action={aksesAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="id" value={id} />
          <label className="block">
            <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Nama</span>
            <input name="nama" defaultValue={nama} required className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Divisi (akses)</span>
            <select name="divisi" defaultValue={divisi} className="input">
              {DIVISI_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={aksesPending}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Simpan
          </button>
        </form>

        <form action={passwordAction} className="flex items-end gap-2">
          <input type="hidden" name="id" value={id} />
          <label className="block">
            <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Password baru</span>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="Min. 8 karakter"
              className="input"
            />
          </label>
          <button
            type="submit"
            disabled={passwordPending}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Reset Password
          </button>
        </form>

        <form action={toggleAction}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            disabled={isSelf && aktif}
            title={isSelf && aktif ? "Tidak bisa menonaktifkan akun sendiri" : undefined}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {aktif ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </form>
      </div>

      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
