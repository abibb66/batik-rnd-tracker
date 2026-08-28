"use client";

import { useState } from "react";
import Link from "next/link";
import { DriveThumbnail } from "@/components/DriveThumbnail";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTransitionForm } from "@/components/StatusTransitionForm";
import { ProdukEditFormMarketing } from "@/components/ProdukEditFormMarketing";
import { DeleteProdukButton } from "@/components/DeleteProdukButton";
import { RiwayatTimeline } from "@/components/RiwayatTimeline";
import { updateStatusMarketing } from "@/app/marketing/actions";
import type { Produk, RiwayatStatus, User } from "@/generated/prisma/client";

type RiwayatEntry = RiwayatStatus & { diubahOleh: User | null };

export function MarketingRow({
  produk,
  riwayat,
  tanggalReadyStok,
  tanggalReadyToLaunch,
  kategoriLabelMap,
  statusLabelMap,
  transitions,
  canEdit,
  isAdmin,
}: {
  produk: Produk;
  riwayat: RiwayatEntry[];
  tanggalReadyStok: Date | null;
  tanggalReadyToLaunch: Date | null;
  kategoriLabelMap: Record<string, string>;
  statusLabelMap: Record<string, string>;
  transitions: Record<string, string[]>;
  canEdit: boolean;
  isAdmin: boolean;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <tr className="border-t border-zinc-100 transition-colors hover:bg-indigo-50/40 dark:border-zinc-800 dark:hover:bg-indigo-950/20">
        <td className="px-4 py-3">
          <DriveThumbnail url={produk.desainLink} alt={produk.kodeProduk} />
        </td>
        <td className="px-4 py-3 font-semibold">
          <Link
            href={`/marketing/${produk.id}`}
            className="text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
          >
            {produk.kodeProduk}
          </Link>
        </td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{produk.namaMotif ?? "-"}</td>
        <td className="max-w-[220px] truncate px-4 py-3 text-zinc-600 dark:text-zinc-400" title={produk.filosofiMotif ?? undefined}>
          {produk.filosofiMotif ?? "-"}
        </td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{produk.sku ?? "-"}</td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{produk.uspWarna ?? "-"}</td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {produk.kategori ? kategoriLabelMap[produk.kategori] : "-"}
        </td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {tanggalReadyStok ? tanggalReadyStok.toLocaleDateString("id-ID") : "-"}
        </td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {tanggalReadyToLaunch ? tanggalReadyToLaunch.toLocaleDateString("id-ID") : "-"}
        </td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {produk.planLaunching ? produk.planLaunching.toLocaleDateString("id-ID") : "-"}
        </td>
        <td className="max-w-[220px] truncate px-4 py-3 text-zinc-600 dark:text-zinc-400" title={produk.kendalaMarketing ?? undefined}>
          {produk.kendalaMarketing ?? "-"}
        </td>
        <td className="px-4 py-3">
          <StatusBadge label={statusLabelMap[produk.statusMarketing]} status={produk.statusMarketing} />
        </td>
        <td className="px-4 py-3 text-right">
          {canEdit && (
            <button type="button" onClick={() => setEditing((v) => !v)} className="btn-ghost">
              {editing ? "Tutup" : "Ubah"}
            </button>
          )}
        </td>
      </tr>
      {canEdit && editing && (
        <tr className="border-t border-zinc-100 dark:border-zinc-800">
          <td colSpan={13} className="bg-zinc-50/60 px-4 py-5 dark:bg-zinc-950/40">
            <div className="flex items-start gap-4">
              <DriveThumbnail url={produk.desainLink} alt={produk.kodeProduk} size="lg" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                    Ubah Status Marketing
                  </h3>
                  {isAdmin && <DeleteProdukButton produkId={produk.id} kodeProduk={produk.kodeProduk} />}
                </div>
                <div className="mt-2 max-w-xl">
                  <StatusTransitionForm
                    produkId={produk.id}
                    currentStatus={produk.statusMarketing}
                    statusLabel={statusLabelMap}
                    transitions={transitions}
                    action={updateStatusMarketing}
                    finalMessage="Produk sudah Launch — proses selesai."
                  />
                </div>

                <h3 className="mt-6 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                  Input Marketing
                </h3>
                <div className="mt-2 max-w-xl">
                  <ProdukEditFormMarketing produk={produk} redirectTo="/marketing" />
                </div>

                <h3 className="mt-6 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                  Riwayat Status
                </h3>
                <div className="mt-2">
                  <RiwayatTimeline riwayat={riwayat} />
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
