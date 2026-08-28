import { prisma } from "@/lib/prisma";
import { PpicRow } from "@/components/PpicRow";
import { getDropdownLabelMap, getDropdownOptions, buildTransitions } from "@/lib/status";
import { getSession, canManage } from "@/lib/auth";
import { Divisi } from "@/generated/prisma/client";

export default async function PpicPage() {
  const [produkList, KATEGORI_LABEL, STATUS_PPIC_LABEL, statusPpicOptions, session] = await Promise.all([
    prisma.produk.findMany({
      where: { statusRnd: "PO_KAIN" },
      orderBy: { updatedAt: "desc" },
      include: { riwayatStatus: { orderBy: { timestamp: "desc" }, include: { diubahOleh: true } } },
    }),
    getDropdownLabelMap("KATEGORI"),
    getDropdownLabelMap("STATUS_PPIC"),
    getDropdownOptions("STATUS_PPIC"),
    getSession(),
  ]);
  const canEdit = canManage(session, Divisi.PPIC);
  const isAdmin = session?.divisi === Divisi.ADMIN;

  return (
    <main className="mx-auto max-w-5xl px-8 py-12">
      <div className="text-center">
        <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard PPIC</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Produk yang sudah PO Kain di RnD — PPIC berjalan independen dari Warehouse.
          {canEdit && " Klik \"Ubah\" untuk edit langsung dari sini."}
        </p>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-indigo-50/60 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:bg-indigo-950/30 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2.5 text-center text-[10px]"></th>
              <th className="px-4 py-2.5 text-center text-[10px]">Kode Produk</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Kategori / Vendor</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Estimasi Jadi</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Tanggal Ready Stok</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Plan Launching</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Link Pola Kemeja</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Kendala</th>
              <th className="px-4 py-2.5 text-center text-[10px]">Status PPIC</th>
              <th className="px-4 py-2.5 text-center text-[10px]"></th>
            </tr>
          </thead>
          <tbody>
            {produkList.map((p) => {
              const tanggalReadyStok =
                p.riwayatStatus.find((r) => r.divisi === "PPIC" && r.statusKe === "READY_STOK")?.timestamp ?? null;
              return (
                <PpicRow
                  key={p.id}
                  produk={p}
                  riwayat={p.riwayatStatus}
                  tanggalReadyStok={tanggalReadyStok}
                  kategoriLabelMap={KATEGORI_LABEL}
                  statusLabelMap={STATUS_PPIC_LABEL}
                  transitions={buildTransitions(statusPpicOptions, p.statusPpic)}
                  canEdit={canEdit}
                  isAdmin={isAdmin}
                />
              );
            })}
            {produkList.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-zinc-500" colSpan={10}>
                  Belum ada produk yang PO Kain.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
