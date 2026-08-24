"use client";

import { useActionState } from "react";

type ActionState = { error?: string };
type ServerAction = (prevState: ActionState, formData: FormData) => Promise<ActionState>;

export function StatusTransitionForm<S extends string>({
  produkId,
  currentStatus,
  statusLabel,
  transitions,
  action,
  finalMessage,
}: {
  produkId: string;
  currentStatus: S;
  statusLabel: Record<S, string>;
  transitions: Record<S, S[]>;
  action: ServerAction;
  finalMessage: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const nextOptions = transitions[currentStatus];

  if (nextOptions.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">{finalMessage}</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="produkId" value={produkId} />
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Ubah status ke</span>
          <select name="statusKe" required defaultValue="" className="input">
            <option value="" disabled>
              Pilih status
            </option>
            {nextOptions.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Catatan</span>
          <input name="catatan" placeholder="Opsional" className="input" />
        </label>
      </div>
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Menyimpan..." : "Update Status"}
      </button>
    </form>
  );
}
