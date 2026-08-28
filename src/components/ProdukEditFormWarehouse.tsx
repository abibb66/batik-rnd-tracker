"use client";

import { useActionState } from "react";
import { updateProdukDetailWarehouse, type UpdateDetailState } from "@/app/warehouse/actions";
import type { Produk } from "@/generated/prisma/client";

const initialState: UpdateDetailState = {};

export function ProdukEditFormWarehouse({
  produk,
  redirectTo,
}: {
  produk: Produk;
  redirectTo?: string;
}) {
  const [state, formAction, pending] = useActionState(updateProdukDetailWarehouse, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="produkId" value={produk.id} />
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <label className="block max-w-xs">
        <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">SKU</span>
        <input name="sku" defaultValue={produk.sku ?? ""} placeholder="BTK-0001-EXCL-BIRU" className="input" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Kendala (catatan bebas)
        </span>
        <textarea
          name="kendalaWarehouse"
          rows={2}
          defaultValue={produk.kendalaWarehouse ?? ""}
          placeholder="Mis. rak penyimpanan penuh"
          className="input"
        />
      </label>

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
