"use client";

import { useActionState } from "react";
import { deleteProduk, type DeleteProdukState } from "@/app/admin/actions";

const initialState: DeleteProdukState = {};

export function DeleteProdukButton({ produkId, kodeProduk }: { produkId: string; kodeProduk: string }) {
  const [state, action, pending] = useActionState(deleteProduk, initialState);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const ok = window.confirm(
          `Hapus produk "${kodeProduk}" secara permanen? Semua riwayat status ikut terhapus dan tidak bisa dikembalikan.`
        );
        if (!ok) e.preventDefault();
      }}
    >
      <input type="hidden" name="produkId" value={produkId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6m2 0-.7 9.1a1.5 1.5 0 0 1-1.5 1.4H8.2a1.5 1.5 0 0 1-1.5-1.4L6 6" />
        </svg>
        {pending ? "Menghapus..." : "Hapus Produk"}
      </button>
      {state.error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
