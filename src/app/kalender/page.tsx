import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDropdownLabelMap } from "@/lib/status";
import { kategoriTint } from "@/lib/kategori";

const HARI_LABEL = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function shiftMonth(bulan: number, tahun: number, offset: number) {
  const total = bulan - 1 + offset;
  const newTahun = tahun + Math.floor(total / 12);
  const newBulan = ((total % 12) + 12) % 12;
  return { bulan: newBulan + 1, tahun: newTahun };
}

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const bulanParsed = Number(sp.bulan);
  const tahunParsed = Number(sp.tahun);
  const bulan = bulanParsed >= 1 && bulanParsed <= 12 ? bulanParsed : now.getUTCMonth() + 1;
  const tahun = Number.isInteger(tahunParsed) && tahunParsed > 0 ? tahunParsed : now.getUTCFullYear();

  const [produkList, KATEGORI_LABEL] = await Promise.all([
    prisma.produk.findMany({
      where: { planLaunching: { not: null } },
      select: { id: true, kodeProduk: true, kategori: true, namaMotif: true, planLaunching: true },
      orderBy: { planLaunching: "asc" },
    }),
    getDropdownLabelMap("KATEGORI"),
  ]);

  const firstOfMonth = new Date(Date.UTC(tahun, bulan - 1, 1));
  const daysInMonth = new Date(Date.UTC(tahun, bulan, 0)).getUTCDate();
  const firstWeekday = firstOfMonth.getUTCDay(); // 0 = Minggu
  const leadingBlanks = (firstWeekday + 6) % 7; // geser jadi Senin = 0

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = leadingBlanks; i > 0; i--) {
    cells.push({ date: new Date(Date.UTC(tahun, bulan - 1, 1 - i)), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(Date.UTC(tahun, bulan - 1, d)), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const lastDate = cells[cells.length - 1].date;
    const next = new Date(lastDate);
    next.setUTCDate(next.getUTCDate() + 1);
    cells.push({ date: next, inMonth: false });
  }

  const produkByDate = new Map<string, typeof produkList>();
  const kategoriBulanIni = new Map<string, number>();
  let totalBulanIni = 0;
  for (const p of produkList) {
    if (!p.planLaunching) continue;
    const key = dateKey(p.planLaunching);
    const arr = produkByDate.get(key) ?? [];
    arr.push(p);
    produkByDate.set(key, arr);

    if (p.planLaunching.getUTCFullYear() === tahun && p.planLaunching.getUTCMonth() === bulan - 1) {
      totalBulanIni++;
      const k = p.kategori ?? "TANPA_KATEGORI";
      kategoriBulanIni.set(k, (kategoriBulanIni.get(k) ?? 0) + 1);
    }
  }
  const ringkasanKategori = [...kategoriBulanIni.entries()].sort((a, b) => b[1] - a[1]);

  const judulBulan = firstOfMonth.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const prev = shiftMonth(bulan, tahun, -1);
  const next = shiftMonth(bulan, tahun, 1);
  const todayKey = dateKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())));

  return (
    <main className="mx-auto max-w-6xl px-8 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Kalender Plan Launching
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Jadwal rencana launching produk per bulan, lintas semua kategori.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-600">Total bulan ini</span>
          <span className="pill bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {totalBulanIni} produk
          </span>
          {ringkasanKategori.map(([k, count]) => (
            <span key={k} className={`pill ${kategoriTint(k)}`}>
              {KATEGORI_LABEL[k] ?? "Tanpa kategori"} ({count})
            </span>
          ))}
        </div>
      </div>

      <div className="card mt-6 p-4">
        <div className="flex items-center justify-between px-1 pb-3">
          <h2 className="text-lg font-bold text-zinc-900 capitalize dark:text-zinc-50">{judulBulan}</h2>
          <div className="flex items-center gap-1.5">
            <Link
              href={`/kalender?bulan=${prev.bulan}&tahun=${prev.tahun}`}
              aria-label="Bulan sebelumnya"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              ‹
            </Link>
            <Link href="/kalender" className="btn-secondary px-3 py-1.5 text-xs">
              Hari Ini
            </Link>
            <Link
              href={`/kalender?bulan=${next.bulan}&tahun=${next.tahun}`}
              aria-label="Bulan berikutnya"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              ›
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          {HARI_LABEL.map((h) => (
            <div
              key={h}
              className="border-b border-zinc-200 bg-zinc-50 px-2 py-2 text-center text-[11px] font-semibold tracking-wide text-zinc-500 uppercase dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
            >
              {h}
            </div>
          ))}

          {cells.map(({ date, inMonth }, i) => {
            const key = dateKey(date);
            const entries = produkByDate.get(key) ?? [];
            const isToday = key === todayKey;
            return (
              <div
                key={key + i}
                className={`min-h-[96px] border-r border-b border-zinc-100 p-1.5 last:border-r-0 dark:border-zinc-800/70 ${
                  inMonth ? "bg-white dark:bg-zinc-900" : "bg-zinc-50/60 dark:bg-zinc-950/40"
                }`}
              >
                <div
                  className={`mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                    isToday
                      ? "bg-indigo-600 text-white"
                      : inMonth
                        ? "text-zinc-600 dark:text-zinc-400"
                        : "text-zinc-300 dark:text-zinc-700"
                  }`}
                >
                  {date.getUTCDate()}
                </div>
                <div className="flex flex-col gap-1">
                  {entries.map((p) => (
                    <Link
                      key={p.id}
                      href={`/rnd/${p.id}`}
                      className={`block truncate rounded px-1.5 py-0.5 text-[10px] font-semibold ${kategoriTint(p.kategori ?? "")}`}
                      title={`${p.kodeProduk}${p.namaMotif ? ` — ${p.namaMotif}` : ""}`}
                    >
                      {p.namaMotif ?? p.kodeProduk}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
