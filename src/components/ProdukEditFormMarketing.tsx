"use client";

import { useActionState } from "react";
import { updateProdukDetailMarketing, type UpdateDetailState } from "@/app/marketing/actions";
import type { Produk } from "@/generated/prisma/client";

const initialState: UpdateDetailState = {};

export function ProdukEditFormMarketing({ produk }: { produk: Produk }) {
  const [state, formAction, pending] = useActionState(updateProdukDetailMarketing, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="produkId" value={produk.id} />
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Nama Motif</span>
        <input name="namaMotif" defaultValue={produk.namaMotif ?? ""} placeholder="Parang Segara Biru" className="input" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Filosofi Motif</span>
        <textarea
          name="filosofiMotif"
          rows={3}
          defaultValue={produk.filosofiMotif ?? ""}
          placeholder="Cerita/filosofi di balik motif untuk konten marketing"
          className="input"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Link Produk Marketplace
        </span>
        <input
          type="url"
          name="linkMarketplace"
          defaultValue={produk.linkMarketplace ?? ""}
          placeholder="https://tokopedia.com/... atau https://shopee.co.id/..."
          className="input"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Kendala (catatan bebas)
        </span>
        <textarea
          name="kendalaMarketing"
          rows={2}
          defaultValue={produk.kendalaMarketing ?? ""}
          placeholder="Mis. menunggu approval foto produk"
          className="input"
        />
      </label>

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
