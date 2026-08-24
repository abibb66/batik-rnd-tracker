"use client";

import { useActionState } from "react";
import { updateSiteSettings, type SettingsState } from "@/app/admin/pengaturan/actions";

const initialState: SettingsState = {};

export function SiteSettingsForm({ namaSitus, logoUrl }: { namaSitus: string; logoUrl: string | null }) {
  const [state, action, pending] = useActionState(updateSiteSettings, initialState);

  return (
    <form action={action} className="card mt-6 space-y-5 p-5">
      <label className="block max-w-sm">
        <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Nama Situs</span>
        <input name="namaSitus" defaultValue={namaSitus} required className="input" />
      </label>

      <div>
        <span className="mb-1.5 block text-xs text-zinc-500 dark:text-zinc-400">Logo saat ini</span>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="Logo"
            className="h-12 w-12 rounded-lg border border-zinc-200 bg-white object-contain dark:border-zinc-800"
          />
        ) : (
          <p className="text-sm text-zinc-400 dark:text-zinc-600">Belum ada logo, memakai ikon default.</p>
        )}
      </div>

      <label className="block max-w-sm">
        <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
          Ganti logo (PNG/JPG/WEBP/SVG, maks 2MB)
        </span>
        <input
          type="file"
          name="logo"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="input"
        />
      </label>

      {logoUrl && (
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input type="checkbox" name="hapusLogo" className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700" />
          Hapus logo saat ini (kembali ke ikon default)
        </label>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>

      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && <p className="text-xs text-emerald-600 dark:text-emerald-400">Tersimpan.</p>}
    </form>
  );
}
