import { prisma } from "@/lib/prisma";
import { MarketingRow } from "@/components/MarketingRow";
import { getDropdownLabelMap, getDropdownOptions, buildTransitions, getDropdownValuesAtLeast } from "@/lib/status";
import { getSession, canManage } from "@/lib/auth";
import { Divisi } from "@/generated/prisma/client";

export default async function MarketingPage() {
  const statusPpicEligible = await getDropdownValuesAtLeast("STATUS_PPIC", "READY_KAIN");
  const [produkList, KATEGORI_LABEL, STATUS_MARKETING_LABEL, statusMarketingOptions, session] = await Promise.all([
    prisma.produk.findMany({
      where: { statusPpic: { in: statusPpicEligible } },
      orderBy: { updatedAt: "desc" },
      include: { riwayatStatus: { orderBy: { timestamp: "desc" }, include: { diubahOleh: true } } },
    }),
    getDropdownLabelMap("KATEGORI"),
    getDropdownLabelMap("STATUS_MARKETING"),
    getDropdownOptions("STATUS_MARKETING"),
    getSession(),
  ]);
  const canEdit = canManage(session, Divisi.MARKETING);
  const isAdmin = session?.divisi === Divisi.ADMIN;

  return (
    <main className="mx-auto max-w-5xl px-8 py-12">
      <div className="text-center">
        <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard Marketing</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {canEdit && "Klik \"Ubah\" untuk edit langsung dari sini."}
        </p>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-indigo-50/60 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:bg-indigo-950/30 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">Kode Produk</th>
              <th className="px-4 py-3">Nama Motif</th>
              <th className="px-4 py-3">Filosofi Motif</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Kategori / USP</th>
              <th className="px-4 py-3">Tanggal Ready Stok</th>
              <th className="px-4 py-3">Tanggal Ready to Launch</th>
              <th className="px-4 py-3">Plan Launching</th>
              <th className="px-4 py-3">Kendala</th>
              <th className="px-4 py-3">Status Marketing</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {produkList.map((p) => {
              const tanggalReadyStok =
                p.riwayatStatus.find((r) => r.divisi === "PPIC" && r.statusKe === "READY_STOK")?.timestamp ?? null;
              const tanggalReadyToLaunch =
                p.riwayatStatus.find((r) => r.divisi === "WAREHOUSE" && r.statusKe === "READY_TO_LAUNCH")
                  ?.timestamp ?? null;
              return (
                <MarketingRow
                  key={p.id}
                  produk={p}
                  riwayat={p.riwayatStatus}
                  tanggalReadyStok={tanggalReadyStok}
                  tanggalReadyToLaunch={tanggalReadyToLaunch}
                  kategoriLabelMap={KATEGORI_LABEL}
                  statusLabelMap={STATUS_MARKETING_LABEL}
                  transitions={buildTransitions(statusMarketingOptions, p.statusMarketing)}
                  canEdit={canEdit}
                  isAdmin={isAdmin}
                />
              );
            })}
            {produkList.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-zinc-500" colSpan={12}>
                  Belum ada produk yang Ready Kain di PPIC.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
