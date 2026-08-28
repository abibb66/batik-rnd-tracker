"use client";

import { useActionState } from "react";
import { createProduk, type CreateProdukState } from "@/app/rnd/actions";

const initialState: CreateProdukState = {};

export function ProdukForm({
  kategoriLabelMap,
  vendorList,
}: {
  kategoriLabelMap: Record<string, string>;
  vendorList: string[];
}) {
  const [state, formAction, pending] = useActionState(createProduk, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-6">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Kode Produk" error={state.fieldErrors?.kodeProduk}>
          <input
            name="kodeProduk"
            required
            placeholder="BTK-0002"
            className="input"
          />
        </Field>

        <Field label="Kategori" error={state.fieldErrors?.kategori}>
          <select name="kategori" required defaultValue="" className="input">
            <option value="" disabled>
              Pilih kategori
            </option>
            {Object.entries(kategoriLabelMap).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Vendor" error={state.fieldErrors?.vendor}>
          <input name="vendor" required list="vendor-list" placeholder="Pilih atau ketik vendor" className="input" />
          <datalist id="vendor-list">
            {vendorList.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </Field>

        <Field label="USP / Warna">
          <input name="uspWarna" placeholder="Motif parang biru indigo" className="input" />
        </Field>

        <Field label="Tanggal Mulai">
          <input type="date" name="tanggalMulai" className="input" />
        </Field>

        <Field label="Plan Launching">
          <input type="date" name="planLaunching" className="input" />
        </Field>

        <Field label="Link Desain">
          <input type="url" name="desainLink" placeholder="https://drive.google.com/..." className="input" />
        </Field>

        <Field label="Link Pola Kemeja">
          <input type="url" name="polaKemejaLink" placeholder="https://drive.google.com/..." className="input" />
        </Field>

        <Field label="Link Folder Google Drive">
          <input type="url" name="driveFolderLink" placeholder="https://drive.google.com/drive/folders/..." className="input" />
        </Field>
      </div>

      <Field label="Catatan">
        <textarea name="catatan" rows={2} placeholder="Catatan opsional untuk riwayat status" className="input" />
      </Field>

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Menyimpan..." : "Simpan Produk"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}
