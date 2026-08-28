import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { DriveFilePreview } from "@/components/DriveFilePreview";
import { getDropdownLabelMap, getDropdownValuesAtLeast } from "@/lib/status";
import { kategoriTint } from "@/lib/kategori";

const FILTER_KEYS = [
  "rnd",
  "ppic_warehouse",
  "launch",
  "rejected",
  "belum_pola",
  "belum_sku",
  "belum_nama_filosofi",
] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

type ProdukRow = {
  statusRnd: string;
  statusPpic: string;
  statusWarehouse: string;
  statusMarketing: string;
  polaKemejaLink: string | null;
  sku: string | null;
  namaMotif: string | null;
  filosofiMotif: string | null;
};

function matchesFilter(p: ProdukRow, filter: FilterKey | undefined, marketingEligible: Set<string>) {
  switch (filter) {
    case "rnd":
      return p.statusRnd !== "PO_KAIN" && p.statusRnd !== "REJECTED";
    case "ppic_warehouse":
      return p.statusRnd === "PO_KAIN" && p.statusWarehouse !== "READY_TO_LAUNCH";
    case "launch":
      return p.statusMarketing === "LAUNCH";
    case "rejected":
      return p.statusRnd === "REJECTED";
    // "Sudah waktunya diisi tapi masih kosong" — digerbangi tahap yang sama
    // dengan yang membuka divisi terkait (lihat panduan alur kerja).
    case "belum_pola":
      return p.statusRnd === "PO_KAIN" && !p.polaKemejaLink;
    case "belum_sku":
      return p.statusRnd === "PO_KAIN" && !p.sku;
    case "belum_nama_filosofi":
      return marketingEligible.has(p.statusPpic) && (!p.namaMotif || !p.filosofiMotif);
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
  const activeFilter = FILTER_KEYS.includes(sp.filter as FilterKey) ? (sp.filter as FilterKey) : undefined;
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
    statusPpicEligibleUntukMarketing,
  ] = await Promise.all([
    prisma.produk.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        riwayatStatus: {
          where: { divisi: "MARKETING", statusKe: "LAUNCH" },
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
    }),
    getDropdownLabelMap("KATEGORI"),
    getDropdownLabelMap("STATUS_RND"),
    getDropdownLabelMap("STATUS_PPIC"),
    getDropdownLabelMap("STATUS_WAREHOUSE"),
    getDropdownLabelMap("STATUS_MARKETING"),
    getDropdownValuesAtLeast("STATUS_PPIC", "READY_KAIN"),
  ]);
  const marketingEligible = new Set(statusPpicEligibleUntukMarketing);

  const total = produkList.length;
  const diRnd = produkList.filter((p) => matchesFilter(p, "rnd", marketingEligible)).length;
  const diPpicWarehouse = produkList.filter((p) => matchesFilter(p, "ppic_warehouse", marketingEligible)).length;
  const launch = produkList.filter((p) => matchesFilter(p, "launch", marketingEligible)).length;
  const rejected = produkList.filter((p) => matchesFilter(p, "rejected", marketingEligible)).length;
  const belumPola = produkList.filter((p) => matchesFilter(p, "belum_pola", marketingEligible)).length;
  const belumSku = produkList.filter((p) => matchesFilter(p, "belum_sku", marketingEligible)).length;
  const belumNamaFilosofi = produkList.filter((p) =>
    matchesFilter(p, "belum_nama_filosofi", marketingEligible)
  ).length;

  const stats: [string, number, FilterKey | undefined][] = [
    ["Total produk", total, undefined],
    ["Sedang di RnD", diRnd, "rnd"],
    ["PPIC & Warehouse jalan", diPpicWarehouse, "ppic_warehouse"],
    ["Sudah Launch", launch, "launch"],
    ["Rejected", rejected, "rejected"],
    ["Belum Ada Pola", belumPola, "belum_pola"],
    ["Belum Ada SKU", belumSku, "belum_sku"],
    ["Belum Nama & Filosofi", belumNamaFilosofi, "belum_nama_filosofi"],
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
    if (!matchesFilter(p, activeFilter, marketingEligible)) return false;
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
        </div>
        <Link href="/rnd/baru" className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 4v12M4 10h12" />
          </svg>
          Produk Baru
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {stats.map(([label, value, key]) => {
          const isActive = key === activeFilter;
          const isTotal = key === undefined;
          const isPerluDiisi = key === "belum_pola" || key === "belum_sku" || key === "belum_nama_filosofi";
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
                    : isPerluDiisi && value > 0
                      ? "text-amber-600 dark:text-amber-400"
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
          {filtered.map((p) => {
            const missingPola = matchesFilter(p, "belum_pola", marketingEligible);
            const missingSku = matchesFilter(p, "belum_sku", marketingEligible);
            const missingNamaFilosofi = matchesFilter(p, "belum_nama_filosofi", marketingEligible);
            const isLaunched = p.statusMarketing === "LAUNCH";
            const tanggalLaunch = p.riwayatStatus[0]?.timestamp ?? null;
            return (
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

                {!isLaunched && (missingPola || missingSku || missingNamaFilosofi) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {missingPola && (
                      <span className="pill bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        Perlu RnD: pola
                      </span>
                    )}
                    {missingSku && (
                      <span className="pill bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        Perlu Warehouse: SKU
                      </span>
                    )}
                    {missingNamaFilosofi && (
                      <span className="pill bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        Perlu Marketing: nama/filosofi
                      </span>
                    )}
                  </div>
                )}

                {(p.kendalaPpic || p.kendalaWarehouse || p.kendalaMarketing) && (
                  <div className="mt-2 flex flex-col gap-1 rounded-lg bg-rose-50 px-2.5 py-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    {p.kendalaPpic && (
                      <p>
                        <span className="font-semibold">Kendala PPIC:</span> {p.kendalaPpic}
                      </p>
                    )}
                    {p.kendalaWarehouse && (
                      <p>
                        <span className="font-semibold">Kendala Warehouse:</span> {p.kendalaWarehouse}
                      </p>
                    )}
                    {p.kendalaMarketing && (
                      <p>
                        <span className="font-semibold">Kendala Marketing:</span> {p.kendalaMarketing}
                      </p>
                    )}
                  </div>
                )}

                {isLaunched ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <StatusBadge label={`Launch${tanggalLaunch ? ` — ${tanggalLaunch.toLocaleDateString("id-ID")}` : ""}`} status="LAUNCH" />
                    {p.namaMotif && (
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{p.namaMotif}</p>
                    )}
                    {p.filosofiMotif && (
                      <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{p.filosofiMotif}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {p.vendor && <span>Vendor: {p.vendor}</span>}
                      {p.uspWarna && <span>USP: {p.uspWarna}</span>}
                      {p.sku && <span>SKU: {p.sku}</span>}
                    </div>
                    {p.linkMarketplace && (
                      <a
                        href={p.linkMarketplace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        Lihat di Marketplace ↗
                      </a>
                    )}
                  </div>
                ) : (
                  <>
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
                      {p.uspWarna && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-400 dark:text-zinc-600">
                            <path d="M10 3l1.9 4.6 5 .4-3.8 3.3 1.2 4.9-4.3-2.7-4.3 2.7 1.2-4.9L3 8l5-.4z" />
                          </svg>
                          {p.uspWarna}
                        </div>
                      )}
                      {p.namaMotif && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-400 dark:text-zinc-600">
                            <path d="M4 4h9l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
                            <path d="M7 8h6M7 11h6M7 14h3" />
                          </svg>
                          {p.namaMotif}
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
                  </>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
