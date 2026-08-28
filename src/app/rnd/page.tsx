import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RndRow } from "@/components/RndRow";
import { getDropdownLabelMap, getDropdownOptions, buildTransitions } from "@/lib/status";
import { getSession, canManage } from "@/lib/auth";
import { Divisi } from "@/generated/prisma/client";

export default async function RndPage() {
  const [produkList, KATEGORI_LABEL, STATUS_RND_LABEL, statusRndOptions, vendors, session] = await Promise.all([
    prisma.produk.findMany({
      orderBy: { createdAt: "desc" },
      include: { riwayatStatus: { orderBy: { timestamp: "desc" }, include: { diubahOleh: true } } },
    }),
    getDropdownLabelMap("KATEGORI"),
    getDropdownLabelMap("STATUS_RND"),
    getDropdownOptions("STATUS_RND"),
    prisma.vendor.findMany({ where: { aktif: true }, orderBy: { nama: "asc" } }),
    getSession(),
  ]);
  const vendorList = vendors.map((v) => v.nama);
  const canEdit = canManage(session, Divisi.RND);
  const isAdmin = session?.divisi === Divisi.ADMIN;

  return (
    <main className="mx-auto max-w-5xl px-8 py-12">
      <div className="text-center">
        <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard RnD</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Produk yang sedang berjalan di RnD.
          {canEdit && " Klik \"Ubah\" untuk edit langsung dari sini."}
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <Link href="/rnd/baru" className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 4v12M4 10h12" />
          </svg>
          Produk Baru
        </Link>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-indigo-50/60 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:bg-indigo-950/30 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2.5 text-center text-[10px]"></th>
              <th className="px-4 py-2.5 text-center text-[10px]">Kode Produk</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Kategori / Vendor / USP</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Tanggal Mulai</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Plan Launching</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Estimasi Strike Off Jadi</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Cetak Paper Sketch</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Link Pola Kemeja</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Link Folder Drive</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Status RnD</th>
              <th className="px-4 py-2.5 text-center text-[10px]"></th>
            </tr>
          </thead>
          <tbody>
            {produkList.map((p) => (
              <RndRow
                key={p.id}
                produk={p}
                riwayat={p.riwayatStatus}
                kategoriLabelMap={KATEGORI_LABEL}
                statusLabelMap={STATUS_RND_LABEL}
                transitions={buildTransitions(statusRndOptions, p.statusRnd)}
                vendorList={vendorList}
                canEdit={canEdit}
                isAdmin={isAdmin}
              />
            ))}
            {produkList.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-zinc-500" colSpan={11}>
                  Belum ada produk.{" "}
                  <Link href="/rnd/baru" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                    Tambah produk baru
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
