import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { getDropdownLabelMap } from "@/lib/status";

export default async function WarehousePage() {
  const [produkList, KATEGORI_LABEL, STATUS_WAREHOUSE_LABEL] = await Promise.all([
    prisma.produk.findMany({ where: { statusRnd: "PO_KAIN" }, orderBy: { updatedAt: "desc" } }),
    getDropdownLabelMap("KATEGORI"),
    getDropdownLabelMap("STATUS_WAREHOUSE"),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-8 py-12">
      <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard Warehouse</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Produk yang sudah PO Kain di RnD — Warehouse berjalan independen dari PPIC.
      </p>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-indigo-50/60 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:bg-indigo-950/30 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">Kode Produk</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3">Status Warehouse</th>
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
                    href={`/warehouse/${p.id}`}
                    className="text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
                  >
                    {p.kodeProduk}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {p.kategori ? KATEGORI_LABEL[p.kategori] : "-"}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.sku ?? "-"}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.stok ?? "-"}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={STATUS_WAREHOUSE_LABEL[p.statusWarehouse]} status={p.statusWarehouse} />
                </td>
              </tr>
            ))}
            {produkList.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-zinc-500" colSpan={5}>
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
