import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { DriveFilePreview } from "@/components/DriveFilePreview";
import { getDropdownLabelMap } from "@/lib/status";

type FilterKey = "rnd" | "ppic_warehouse" | "launch" | "rejected";

type ProdukRow = {
  statusRnd: string;
  statusWarehouse: string;
  statusMarketing: string;
};

function matchesFilter(p: ProdukRow, filter: FilterKey | undefined) {
  switch (filter) {
    case "rnd":
      return p.statusRnd !== "PO_KAIN" && p.statusRnd !== "REJECTED";
    case "ppic_warehouse":
      return p.statusRnd === "PO_KAIN" && p.statusWarehouse !== "READY_TO_LAUNCH";
    case "launch":
      return p.statusMarketing === "LAUNCH";
    case "rejected":
      return p.statusRnd === "REJECTED";
    default:
      return true;
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; vendor?: string; kategori?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const activeFilter = (["rnd", "ppic_warehouse", "launch", "rejected"] as const).includes(sp.filter as FilterKey)
    ? (sp.filter as FilterKey)
    : undefined;
  const activeVendor = sp.vendor?.trim() || undefined;
  const activeKategori = sp.kategori?.trim() || undefined;
  const q = sp.q?.trim() ?? "";

  const [
    produkList,
    KATEGORI_LABEL,
    STATUS_RND_LABEL,
    STATUS_PPIC_LABEL,
    STATUS_WAREHOUSE_LABEL,
    STATUS_MARKETING_LABEL,
  ] = await Promise.all([
    prisma.produk.findMany({ orderBy: { updatedAt: "desc" } }),
    getDropdownLabelMap("KATEGORI"),
    getDropdownLabelMap("STATUS_RND"),
    getDropdownLabelMap("STATUS_PPIC"),
    getDropdownLabelMap("STATUS_WAREHOUSE"),
    getDropdownLabelMap("STATUS_MARKETING"),
  ]);

  const total = produkList.length;
  const diRnd = produkList.filter((p) => matchesFilter(p, "rnd")).length;
  const diPpicWarehouse = produkList.filter((p) => matchesFilter(p, "ppic_warehouse")).length;
  const launch = produkList.filter((p) => matchesFilter(p, "launch")).length;
  const rejected = produkList.filter((p) => matchesFilter(p, "rejected")).length;

  const stats: [string, number, FilterKey | undefined][] = [
    ["Total produk", total, undefined],
    ["Sedang di RnD", diRnd, "rnd"],
    ["PPIC & Warehouse jalan", diPpicWarehouse, "ppic_warehouse"],
    ["Sudah Launch", launch, "launch"],
    ["Rejected", rejected, "rejected"],
  ];

  const vendorCounts = new Map<string, number>();
  for (const p of produkList) {
    if (!p.vendor) continue;
    vendorCounts.set(p.vendor, (vendorCounts.get(p.vendor) ?? 0) + 1);
  }
  const vendors = [...vendorCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  const kategoriCounts = new Map<string, number>();
  for (const p of produkList) {
    if (!p.kategori) continue;
    kategoriCounts.set(p.kategori, (kategoriCounts.get(p.kategori) ?? 0) + 1);
  }
  const kategoris = [...kategoriCounts.entries()].sort((a, b) =>
    (KATEGORI_LABEL[a[0]] ?? a[0]).localeCompare(KATEGORI_LABEL[b[0]] ?? b[0])
  );

  function buildHref(overrides: {
    filter?: FilterKey | null;
    vendor?: string | null;
    kategori?: string | null;
    q?: string | null;
  }) {
    const params = new URLSearchParams();
    const nextFilter = overrides.filter !== undefined ? overrides.filter : activeFilter;
    const nextVendor = overrides.vendor !== undefined ? overrides.vendor : activeVendor;
    const nextKategori = overrides.kategori !== undefined ? overrides.kategori : activeKategori;
    const nextQ = overrides.q !== undefined ? overrides.q : q;
    if (nextFilter) params.set("filter", nextFilter);
    if (nextVendor) params.set("vendor", nextVendor);
    if (nextKategori) params.set("kategori", nextKategori);
    if (nextQ) params.set("q", nextQ);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  const filtered = produkList.filter((p) => {
    if (!matchesFilter(p, activeFilter)) return false;
    if (activeVendor && p.vendor !== activeVendor) return false;
    if (activeKategori && p.kategori !== activeKategori) return false;
    if (q) {
      const kategoriLabel = p.kategori ? (KATEGORI_LABEL[p.kategori] ?? p.kategori) : "";
      const haystack = `${p.kodeProduk} ${p.vendor ?? ""} ${p.namaMotif ?? ""} ${p.uspWarna ?? ""} ${kategoriLabel}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const adaFilterAktif = Boolean(activeFilter || activeVendor || activeKategori || q);

  const KATEGORI_TINTS: Record<string, string> = {
    EXCLUSIVE: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    SIGNATURE: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    WOMEN: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  };
  const kategoriTint = (k: string) =>
    KATEGORI_TINTS[k] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

  return (
    <main className="mx-auto max-w-6xl px-8 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-wide text-zinc-400 uppercase dark:text-zinc-600">
            Batik RnD Tracker
          </div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard Produk
          </h1>
          <p className="mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
            Posisi semua produk lintas divisi: RnD → PPIC & Warehouse (paralel) → Marketing.
          </p>
        </div>
        <Link href="/rnd/baru" className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 4v12M4 10h12" />
          </svg>
          Produk Baru
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map(([label, value, key]) => {
          const isActive = key === activeFilter;
          const isTotal = key === undefined;
          return (
            <Link
              key={label}
              href={buildHref({ filter: isActive ? null : (key ?? null) })}
              className={`rounded-xl border p-4 text-left transition-colors ${
                isActive
                  ? "border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950"
                  : isTotal
                    ? "border-indigo-200 bg-indigo-50/60 hover:border-indigo-300 dark:border-indigo-900 dark:bg-indigo-950/40 dark:hover:border-indigo-700"
                    : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              }`}
            >
              <div
                className={`text-2xl font-extrabold ${
                  key === "rejected" && value > 0
                    ? "text-red-600 dark:text-red-400"
                    : isActive || isTotal
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-zinc-900 dark:text-zinc-50"
                }`}
              >
                {value}
              </div>
              <div
                className={`mt-0.5 text-xs font-semibold ${
                  isActive || isTotal ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <form action="/" method="get" className="flex max-w-sm flex-1 gap-2">
          {activeFilter && <input type="hidden" name="filter" value={activeFilter} />}
          {activeVendor && <input type="hidden" name="vendor" value={activeVendor} />}
          <div className="relative flex-1">
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="M17 17l-4-4" />
            </svg>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari kode produk, vendor, motif..."
              className="input pl-9"
            />
          </div>
          <button type="submit" className="btn-secondary">
            Cari
          </button>
        </form>

        <div className="flex flex-col gap-2.5">
          {kategoris.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-600">Kategori</span>
              {kategoris.map(([kategori, count]) => {
                const isActive = kategori === activeKategori;
                return (
                  <Link
                    key={kategori}
                    href={buildHref({ kategori: isActive ? null : kategori })}
                    className={`pill ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : `${kategoriTint(kategori)} hover:opacity-80`
                    }`}
                  >
                    {KATEGORI_LABEL[kategori] ?? kategori} ({count})
                  </Link>
                );
              })}
            </div>
          )}

          {vendors.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-600">Vendor</span>
              {vendors.map(([vendor, count]) => {
                const isActive = vendor === activeVendor;
                return (
                  <Link
                    key={vendor}
                    href={buildHref({ vendor: isActive ? null : vendor })}
                    className={`pill border ${
                      isActive
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600"
                    }`}
                  >
                    {vendor} ({count})
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {adaFilterAktif && (
        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          Menampilkan {filtered.length} dari {total} produk.
          <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            Reset filter
          </Link>
        </div>
      )}

      {produkList.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Belum ada produk.{" "}
          <Link href="/rnd/baru" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            Tambah produk baru
          </Link>
          .
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Tidak ada produk yang cocok dengan filter/pencarian ini.{" "}
          <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            Reset filter
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="card overflow-hidden">
              <DriveFilePreview url={p.desainLink} label="Desain" />

              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/rnd/${p.id}`}
                    className="font-bold text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
                  >
                    {p.kodeProduk}
                  </Link>
                  {p.kategori && (
                    <span className={`pill ${kategoriTint(p.kategori)}`}>
                      {KATEGORI_LABEL[p.kategori] ?? p.kategori}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-col gap-1.5">
                  {p.vendor && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-400 dark:text-zinc-600">
                        <path d="M3 17V7l7-4 7 4v10" />
                        <path d="M8 17v-5h4v5" />
                      </svg>
                      {p.vendor}
                    </div>
                  )}
                  {(p.namaMotif || p.uspWarna) && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-400 dark:text-zinc-600">
                        <path d="M10 3l1.9 4.6 5 .4-3.8 3.3 1.2 4.9-4.3-2.7-4.3 2.7 1.2-4.9L3 8l5-.4z" />
                      </svg>
                      {p.namaMotif ?? p.uspWarna}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-400 dark:text-zinc-600">
                      <rect x="2.5" y="4" width="15" height="12" rx="1.5" />
                      <path d="M6 4v12M14 4v12" />
                    </svg>
                    {p.planLaunching ? p.planLaunching.toLocaleDateString("id-ID") : "Plan launching belum diisi"}
                  </div>
                  {p.sku && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-400 dark:text-zinc-600">
                        <path d="M3 5v10M6 5v10M9 5v10M11 5v10M14 5v10M17 5v10" />
                      </svg>
                      {p.sku}
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3.5 dark:border-zinc-800">
                  <Link href={`/rnd/${p.id}`} className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-bold tracking-wide text-zinc-400 uppercase dark:text-zinc-600">
                      RnD
                    </span>
                    <StatusBadge label={STATUS_RND_LABEL[p.statusRnd]} status={p.statusRnd} />
                  </Link>
                  <Link href={`/ppic/${p.id}`} className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-bold tracking-wide text-zinc-400 uppercase dark:text-zinc-600">
                      PPIC
                    </span>
                    <StatusBadge label={STATUS_PPIC_LABEL[p.statusPpic]} status={p.statusPpic} />
                  </Link>
                  <Link href={`/warehouse/${p.id}`} className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-bold tracking-wide text-zinc-400 uppercase dark:text-zinc-600">
                      Warehouse
                    </span>
                    <StatusBadge label={STATUS_WAREHOUSE_LABEL[p.statusWarehouse]} status={p.statusWarehouse} />
                  </Link>
                  <Link href={`/marketing/${p.id}`} className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-bold tracking-wide text-zinc-400 uppercase dark:text-zinc-600">
                      Marketing
                    </span>
                    <StatusBadge label={STATUS_MARKETING_LABEL[p.statusMarketing]} status={p.statusMarketing} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
