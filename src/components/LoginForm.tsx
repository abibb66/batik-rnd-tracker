"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</span>
        <input type="email" name="email" required autoFocus placeholder="nama@batik.local" className="input" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</span>
        <input type="password" name="password" required className="input" />
      </label>

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Masuk..." : "Masuk"}
      </button>
    </form>
  );
}
