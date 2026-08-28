"use client";

import { useState } from "react";
import Link from "next/link";
import { DriveThumbnail } from "@/components/DriveThumbnail";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTransitionForm } from "@/components/StatusTransitionForm";
import { ProdukEditFormWarehouse } from "@/components/ProdukEditFormWarehouse";
import { StokUkuranEditor } from "@/components/StokUkuranEditor";
import { DeleteProdukButton } from "@/components/DeleteProdukButton";
import { RiwayatTimeline } from "@/components/RiwayatTimeline";
import { updateStatusWarehouse } from "@/app/warehouse/actions";
import type { Produk, RiwayatStatus, StokUkuran, User } from "@/generated/prisma/client";

type RiwayatEntry = RiwayatStatus & { diubahOleh: User | null };
type ProdukDenganStok = Produk & { stokUkuran: StokUkuran[] };

export function WarehouseRow({
  produk,
  riwayat,
  tanggalReadyStok,
  kategoriLabelMap,
  statusLabelMap,
  transitions,
  canEdit,
  isAdmin,
}: {
  produk: ProdukDenganStok;
  riwayat: RiwayatEntry[];
  tanggalReadyStok: Date | null;
  kategoriLabelMap: Record<string, string>;
  statusLabelMap: Record<string, string>;
  transitions: Record<string, string[]>;
  canEdit: boolean;
  isAdmin: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const totalStok = produk.stokUkuran.reduce((sum, s) => sum + s.jumlah, 0);

  return (
    <>
      <tr className="border-t border-zinc-100 transition-colors hover:bg-indigo-50/40 dark:border-zinc-800 dark:hover:bg-indigo-950/20">
        <td className="px-4 py-3">
          <DriveThumbnail url={produk.desainLink} alt={produk.kodeProduk} />
        </td>
        <td className="px-4 py-3 font-semibold">
          <Link
            href={`/warehouse/${produk.id}`}
            className="text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
          >
            {produk.kodeProduk}
          </Link>
        </td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {produk.kategori ? kategoriLabelMap[produk.kategori] : "-"}
        </td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{produk.sku ?? "-"}</td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{totalStok}</td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {tanggalReadyStok ? tanggalReadyStok.toLocaleDateString("id-ID") : "-"}
        </td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {produk.planLaunching ? produk.planLaunching.toLocaleDateString("id-ID") : "-"}
        </td>
        <td className="max-w-[220px] truncate px-4 py-3 text-zinc-600 dark:text-zinc-400" title={produk.kendalaWarehouse ?? undefined}>
          {produk.kendalaWarehouse ?? "-"}
        </td>
        <td className="px-4 py-3">
          <StatusBadge label={statusLabelMap[produk.statusWarehouse]} status={produk.statusWarehouse} />
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
          <td colSpan={10} className="bg-zinc-50/60 px-4 py-5 dark:bg-zinc-950/40">
            <div className="flex items-start gap-4">
              <DriveThumbnail url={produk.desainLink} alt={produk.kodeProduk} size="lg" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                    Ubah Status Warehouse
                  </h3>
                  {isAdmin && <DeleteProdukButton produkId={produk.id} kodeProduk={produk.kodeProduk} />}
                </div>
                <div className="mt-2 max-w-xl">
                  <StatusTransitionForm
                    produkId={produk.id}
                    currentStatus={produk.statusWarehouse}
                    statusLabel={statusLabelMap}
                    transitions={transitions}
                    action={updateStatusWarehouse}
                    finalMessage="Ready to Launch tercapai — produk ini sekarang muncul di Dashboard Marketing."
                  />
                </div>

                <h3 className="mt-6 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                  Input Warehouse
                </h3>
                <div className="mt-2 max-w-xl">
                  <ProdukEditFormWarehouse produk={produk} redirectTo="/warehouse" />
                </div>

                <h3 className="mt-6 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                  Stok per Ukuran
                </h3>
                <div className="mt-2 max-w-md">
                  <StokUkuranEditor produkId={produk.id} stokUkuran={produk.stokUkuran} />
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
