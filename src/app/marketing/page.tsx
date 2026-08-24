import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { getDropdownLabelMap, getDropdownValuesAtLeast } from "@/lib/status";

export default async function MarketingPage() {
  const statusPpicEligible = await getDropdownValuesAtLeast("STATUS_PPIC", "READY_KAIN");
  const [produkList, KATEGORI_LABEL, STATUS_MARKETING_LABEL] = await Promise.all([
    prisma.produk.findMany({
      where: { statusPpic: { in: statusPpicEligible } },
      orderBy: { updatedAt: "desc" },
    }),
    getDropdownLabelMap("KATEGORI"),
    getDropdownLabelMap("STATUS_MARKETING"),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-8 py-12">
      <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard Marketing</h1>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-indigo-50/60 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:bg-indigo-950/30 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">Kode Produk</th>
              <th className="px-4 py-3">Nama Motif</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Status Marketing</th>
            </tr>
          </thead>
          <tbody>
            {produkList.map((p) => (
              <tr
                key={p.id}
                className="border-t border-zinc-100 transition-colors hover:bg-indigo-50/40 dark:border-zinc-800 dark:hover:bg-indigo-950/20"
              >
                <td className="px-4 py-3 font-semibold">
                  <Link
                    href={`/marketing/${p.id}`}
                    className="text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
                  >
                    {p.kodeProduk}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.namaMotif ?? "-"}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.sku ?? "-"}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {p.kategori ? KATEGORI_LABEL[p.kategori] : "-"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={STATUS_MARKETING_LABEL[p.statusMarketing]} status={p.statusMarketing} />
                </td>
              </tr>
            ))}
            {produkList.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-zinc-500" colSpan={5}>
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
