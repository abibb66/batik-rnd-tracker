"use client";

import { useActionState, useRef } from "react";
import { createUser, type AkunState } from "@/app/admin/akun/actions";

const initialState: AkunState = {};

const DIVISI_OPTIONS = [
  { value: "RND", label: "RnD" },
  { value: "PPIC", label: "PPIC" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "MARKETING", label: "Marketing" },
  { value: "ADMIN", label: "Admin" },
  { value: "VISITOR", label: "Visitor (lihat saja, tidak bisa edit)" },
] as const;

export function AkunCreateForm() {
  const [state, formAction, pending] = useActionState(createUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-2 border-t border-zinc-200 px-3 py-3 dark:border-zinc-800"
    >
      <label className="block">
        <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Nama</span>
        <input name="nama" required placeholder="Nama lengkap" className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Email</span>
        <input type="email" name="email" required placeholder="nama@batik.local" className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Password</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          placeholder="Min. 8 karakter"
          className="input"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Divisi (akses)</span>
        <select name="divisi" defaultValue="RND" className="input">
          {DIVISI_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        {pending ? "Menambah..." : "Tambah Akun"}
      </button>
      {state.error && <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}
