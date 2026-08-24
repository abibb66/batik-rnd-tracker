import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { getDropdownLabelMap } from "@/lib/status";

export default async function RndPage() {
  const [produkList, KATEGORI_LABEL, STATUS_RND_LABEL] = await Promise.all([
    prisma.produk.findMany({ orderBy: { createdAt: "desc" } }),
    getDropdownLabelMap("KATEGORI"),
    getDropdownLabelMap("STATUS_RND"),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-8 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard RnD</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Produk yang sudah ACC Desain dan sedang berjalan di RnD.
          </p>
        </div>
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
              <th className="px-4 py-3">Kode Produk</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Plan Launching</th>
              <th className="px-4 py-3">Status RnD</th>
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
                    href={`/rnd/${p.id}`}
                    className="text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
                  >
                    {p.kodeProduk}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {p.kategori ? KATEGORI_LABEL[p.kategori] : "-"}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.vendor ?? "-"}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {p.planLaunching ? p.planLaunching.toLocaleDateString("id-ID") : "-"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={STATUS_RND_LABEL[p.statusRnd]} status={p.statusRnd} />
                </td>
              </tr>
            ))}
            {produkList.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-zinc-500" colSpan={5}>
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
