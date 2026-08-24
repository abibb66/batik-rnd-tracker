import { prisma } from "@/lib/prisma";
import { BarChart } from "@/components/BarChart";
import { getDropdownLabelMap } from "@/lib/status";

export default async function StatistikPage() {
  const [produkList, KATEGORI_LABEL] = await Promise.all([
    prisma.produk.findMany(),
    getDropdownLabelMap("KATEGORI"),
  ]);

  const kategoriCounts = new Map<string, number>();
  for (const p of produkList) {
    const key = p.kategori ? (KATEGORI_LABEL[p.kategori] ?? p.kategori) : "Tanpa kategori";
    kategoriCounts.set(key, (kategoriCounts.get(key) ?? 0) + 1);
  }
  const kategoriData = [...kategoriCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const uspCounts = new Map<string, number>();
  for (const p of produkList) {
    const key = p.uspWarna?.trim();
    if (!key) continue;
    uspCounts.set(key, (uspCounts.get(key) ?? 0) + 1);
  }
  const uspData = [...uspCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <main className="mx-auto max-w-4xl px-8 py-12">
      <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Statistik Produk</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Ringkasan jumlah produk per kategori, dan produk dengan USP/warna yang sama.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Total per Kategori
        </h2>
        <div className="card mt-4 p-5">
          <BarChart data={kategoriData} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Total per USP / Warna yang Sama
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Produk dengan isian USP/Warna yang identik dikelompokkan bersama.
        </p>
        <div className="card mt-4 p-5">
          <BarChart data={uspData} />
        </div>
      </section>
    </main>
  );
}
