"use client";

import { useActionState, useRef } from "react";
import { createDropdownOption, type OpsiState } from "@/app/admin/opsi/actions";
import type { DropdownGroup } from "@/lib/status";

const initialState: OpsiState = {};

export function OpsiCreateForm({ grup }: { grup: DropdownGroup }) {
  const [state, formAction, pending] = useActionState(createDropdownOption, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        formRef.current?.reset();
      }}
      className="flex items-center gap-2 border-t border-zinc-200 px-3 py-2 dark:border-zinc-800"
    >
      <input type="hidden" name="grup" value={grup} />
      <input name="label" placeholder="Tambah opsi baru..." required className="input flex-1" />
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
