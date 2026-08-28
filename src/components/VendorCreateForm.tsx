"use client";

import { useActionState, useRef } from "react";
import { createVendor, type VendorState } from "@/app/admin/vendor/actions";

const initialState: VendorState = {};

export function VendorCreateForm() {
  const [state, formAction, pending] = useActionState(createVendor, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-center gap-2 border-t border-zinc-200 px-3 py-2.5 dark:border-zinc-800"
    >
      <input name="nama" placeholder="Nama vendor baru..." required className="input flex-1 min-w-[140px]" />
      <div className="flex items-center gap-1.5">
        <input type="number" name="leadTimeHari" defaultValue={14} min={0} required className="input w-20" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">hari</span>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        {pending ? "Menambah..." : "Tambah"}
      </button>
      {state.error && <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}
