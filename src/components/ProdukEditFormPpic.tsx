"use client";

import { useActionState } from "react";
import { updateProdukDetailPpic, type UpdateDetailState } from "@/app/ppic/actions";
import type { Produk } from "@/generated/prisma/client";

const initialState: UpdateDetailState = {};

function toInputDate(d: Date | null) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function ProdukEditFormPpic({ produk }: { produk: Produk }) {
  const [state, formAction, pending] = useActionState(updateProdukDetailPpic, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="produkId" value={produk.id} />
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tanggal Masuk Vendor
          </span>
          <input
            type="date"
            name="tanggalMasukVendor"
            defaultValue={toInputDate(produk.tanggalMasukVendor)}
            className="input"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Estimasi Jadi</span>
          <input type="date" name="estimasiJadi" defaultValue={toInputDate(produk.estimasiJadi)} className="input" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Kendala (catatan bebas)
        </span>
        <textarea
          name="kendalaPpic"
          rows={2}
          defaultValue={produk.kendalaPpic ?? ""}
          placeholder="Mis. kain terlambat datang dari vendor"
          className="input"
        />
      </label>

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
