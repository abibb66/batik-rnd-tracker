"use client";

import { useActionState } from "react";
import { updateProdukDetail, type UpdateDetailState } from "@/app/rnd/actions";
import { VENDOR_LIST } from "@/lib/vendor";
import type { Produk } from "@/generated/prisma/client";

const initialState: UpdateDetailState = {};

function toInputDate(d: Date | null) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function ProdukEditForm({
  produk,
  kategoriLabelMap,
}: {
  produk: Produk;
  kategoriLabelMap: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(updateProdukDetail, initialState);

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
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Kategori</span>
          <select name="kategori" required defaultValue={produk.kategori ?? ""} className="input">
            <option value="" disabled>
              Pilih kategori
            </option>
            {Object.entries(kategoriLabelMap).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Vendor</span>
          <input name="vendor" required list="vendor-list" defaultValue={produk.vendor ?? ""} className="input" />
          <datalist id="vendor-list">
            {VENDOR_LIST.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">USP / Warna</span>
          <input name="uspWarna" defaultValue={produk.uspWarna ?? ""} className="input" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Tanggal Mulai</span>
          <input type="date" name="tanggalMulai" defaultValue={toInputDate(produk.tanggalMulai)} className="input" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Plan Launching</span>
          <input
            type="date"
            name="planLaunching"
            defaultValue={toInputDate(produk.planLaunching)}
            className="input"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Link Desain</span>
          <input type="url" name="desainLink" defaultValue={produk.desainLink ?? ""} className="input" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Link Pola Kemeja</span>
          <input type="url" name="polaKemejaLink" defaultValue={produk.polaKemejaLink ?? ""} className="input" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Link Folder Google Drive
          </span>
          <input type="url" name="driveFolderLink" defaultValue={produk.driveFolderLink ?? ""} className="input" />
        </label>
      </div>

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
