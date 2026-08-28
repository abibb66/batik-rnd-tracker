"use client";

import { useState } from "react";
import Link from "next/link";
import { DriveThumbnail } from "@/components/DriveThumbnail";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTransitionForm } from "@/components/StatusTransitionForm";
import { ProdukEditForm } from "@/components/ProdukEditForm";
import { DeleteProdukButton } from "@/components/DeleteProdukButton";
import { RiwayatTimeline } from "@/components/RiwayatTimeline";
import { updateStatusRnd } from "@/app/rnd/actions";
import type { Produk, RiwayatStatus, User } from "@/generated/prisma/client";

type RiwayatEntry = RiwayatStatus & { diubahOleh: User | null };

export function RndRow({
  produk,
  riwayat,
  kategoriLabelMap,
  statusLabelMap,
  transitions,
  vendorList,
  canEdit,
  isAdmin,
}: {
  produk: Produk;
  riwayat: RiwayatEntry[];
  kategoriLabelMap: Record<string, string>;
  statusLabelMap: Record<string, string>;
  transitions: Record<string, string[]>;
  vendorList: string[];
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
            href={`/rnd/${produk.id}`}
            className="text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
          >
            {produk.kodeProduk}
          </Link>
        </td>
        <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex flex-col gap-0.5">
            <span>{produk.kategori ? kategoriLabelMap[produk.kategori] : "-"}</span>
            <span>{produk.vendor ?? "-"}</span>
            <span>{produk.uspWarna ?? "-"}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {produk.tanggalMulai ? produk.tanggalMulai.toLocaleDateString("id-ID") : "-"}
        </td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {produk.planLaunching ? produk.planLaunching.toLocaleDateString("id-ID") : "-"}
        </td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {produk.estimasiStrikeOffJadi ? produk.estimasiStrikeOffJadi.toLocaleDateString("id-ID") : "-"}
        </td>
        <td className="px-4 py-3">
          <span
            className={`pill ${
              produk.strikeOffDicetak
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
            }`}
          >
            {produk.strikeOffDicetak ? "Sudah" : "Belum"}
          </span>
        </td>
        <td className="px-4 py-3">
          {produk.polaKemejaLink ? (
            <a
              href={produk.polaKemejaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Buka ↗
            </a>
          ) : (
            <span className="text-zinc-400 dark:text-zinc-600">-</span>
          )}
        </td>
        <td className="px-4 py-3">
          {produk.driveFolderLink ? (
            <a
              href={produk.driveFolderLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Buka ↗
            </a>
          ) : (
            <span className="text-zinc-400 dark:text-zinc-600">-</span>
          )}
        </td>
        <td className="px-4 py-3">
          <StatusBadge label={statusLabelMap[produk.statusRnd]} status={produk.statusRnd} />
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
          <td colSpan={11} className="bg-zinc-50/60 px-4 py-5 dark:bg-zinc-950/40">
            <div className="flex items-start gap-4">
              <DriveThumbnail url={produk.desainLink} alt={produk.kodeProduk} size="lg" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                    Ubah Status
                  </h3>
                  {isAdmin && <DeleteProdukButton produkId={produk.id} kodeProduk={produk.kodeProduk} />}
                </div>
                <div className="mt-2 max-w-xl">
                  <StatusTransitionForm
                    produkId={produk.id}
                    currentStatus={produk.statusRnd}
                    statusLabel={statusLabelMap}
                    transitions={transitions}
                    action={updateStatusRnd}
                    finalMessage="Tidak ada status aktif lain untuk dipilih di RnD."
                  />
                </div>

                <h3 className="mt-6 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                  Detail Produk
                </h3>
                <div className="mt-2 max-w-xl">
                  <ProdukEditForm
                    produk={produk}
                    kategoriLabelMap={kategoriLabelMap}
                    vendorList={vendorList}
                    redirectTo="/rnd"
                  />
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
