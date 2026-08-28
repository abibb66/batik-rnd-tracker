"use client";

import { useState } from "react";
import Link from "next/link";
import { DriveThumbnail } from "@/components/DriveThumbnail";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTransitionForm } from "@/components/StatusTransitionForm";
import { ProdukEditFormPpic } from "@/components/ProdukEditFormPpic";
import { DeleteProdukButton } from "@/components/DeleteProdukButton";
import { RiwayatTimeline } from "@/components/RiwayatTimeline";
import { updateStatusPpic } from "@/app/ppic/actions";
import type { Produk, RiwayatStatus, User } from "@/generated/prisma/client";

type RiwayatEntry = RiwayatStatus & { diubahOleh: User | null };

function LinkCell({ url }: { url: string | null }) {
  if (!url) return <span className="text-zinc-400 dark:text-zinc-600">-</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
    >
      Buka ↗
    </a>
  );
}

export function PpicRow({
  produk,
  riwayat,
  tanggalReadyStok,
  kategoriLabelMap,
  statusLabelMap,
  transitions,
  canEdit,
  isAdmin,
}: {
  produk: Produk;
  riwayat: RiwayatEntry[];
  tanggalReadyStok: Date | null;
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
            href={`/ppic/${produk.id}`}
            className="text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
          >
            {produk.kodeProduk}
          </Link>
        </td>
        <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex flex-col gap-0.5">
            <span>{produk.kategori ? kategoriLabelMap[produk.kategori] : "-"}</span>
            <span>{produk.vendor ?? "-"}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {produk.estimasiJadi ? produk.estimasiJadi.toLocaleDateString("id-ID") : "-"}
        </td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {tanggalReadyStok ? tanggalReadyStok.toLocaleDateString("id-ID") : "-"}
        </td>
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {produk.planLaunching ? produk.planLaunching.toLocaleDateString("id-ID") : "-"}
        </td>
        <td className="px-4 py-3">
          <LinkCell url={produk.polaKemejaLink} />
        </td>
        <td className="max-w-[220px] truncate px-4 py-3 text-zinc-600 dark:text-zinc-400" title={produk.kendalaPpic ?? undefined}>
          {produk.kendalaPpic ?? "-"}
        </td>
        <td className="px-4 py-3">
          <StatusBadge label={statusLabelMap[produk.statusPpic]} status={produk.statusPpic} />
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
                    Ubah Status PPIC
                  </h3>
                  {isAdmin && <DeleteProdukButton produkId={produk.id} kodeProduk={produk.kodeProduk} />}
                </div>
                <div className="mt-2 max-w-xl">
                  <StatusTransitionForm
                    produkId={produk.id}
                    currentStatus={produk.statusPpic}
                    statusLabel={statusLabelMap}
                    transitions={transitions}
                    action={updateStatusPpic}
                    finalMessage="Tidak ada status aktif lain untuk dipilih di PPIC."
                  />
                </div>

                <h3 className="mt-6 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                  Input PPIC
                </h3>
                <div className="mt-2 max-w-xl">
                  <ProdukEditFormPpic produk={produk} redirectTo="/ppic" />
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
