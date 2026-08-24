import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTransitionForm } from "@/components/StatusTransitionForm";
import { ProdukEditFormMarketing } from "@/components/ProdukEditFormMarketing";
import { RiwayatTimeline } from "@/components/RiwayatTimeline";
import { InfoCard } from "@/components/InfoCard";
import { NoAccessNotice } from "@/components/NoAccessNotice";
import { DesainPreviewSection } from "@/components/DesainPreviewSection";
import { getDropdownLabelMap, getDropdownOptions, buildTransitions, isDropdownValueAtLeast } from "@/lib/status";
import { updateStatusMarketing } from "@/app/marketing/actions";
import { getSession, canManage } from "@/lib/auth";
import { Divisi } from "@/generated/prisma/client";

export default async function MarketingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [produk, session, KATEGORI_LABEL, STATUS_MARKETING_LABEL, STATUS_PPIC_LABEL, statusMarketingOptions] =
    await Promise.all([
      prisma.produk.findUnique({
        where: { id },
        include: { riwayatStatus: { orderBy: { timestamp: "desc" }, include: { diubahOleh: true } } },
      }),
      getSession(),
      getDropdownLabelMap("KATEGORI"),
      getDropdownLabelMap("STATUS_MARKETING"),
      getDropdownLabelMap("STATUS_PPIC"),
      getDropdownOptions("STATUS_MARKETING"),
    ]);

  if (!produk) notFound();
  if (!(await isDropdownValueAtLeast("STATUS_PPIC", produk.statusPpic, "READY_KAIN"))) {
    return (
      <main className="mx-auto max-w-3xl px-8 py-12">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Produk {produk.kodeProduk} belum Ready Kain di PPIC, Marketing belum bisa mulai.
        </p>
      </main>
    );
  }
  const canEdit = canManage(session, Divisi.MARKETING);
  const transitions = buildTransitions(statusMarketingOptions, produk.statusMarketing);

  return (
    <main className="mx-auto max-w-3xl px-8 py-12">
      <div className="flex items-center gap-3">
        <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{produk.kodeProduk}</h1>
        <StatusBadge label={STATUS_MARKETING_LABEL[produk.statusMarketing]} status={produk.statusMarketing} />
      </div>

      <div className="mt-4">
        <InfoCard
          items={[
            ["Kategori", produk.kategori ? KATEGORI_LABEL[produk.kategori] : "-"],
            ["Plan Launching", produk.planLaunching ? produk.planLaunching.toLocaleDateString("id-ID") : "-"],
            ["USP / Warna", produk.uspWarna ?? "-"],
            ["SKU", produk.sku ?? "Belum diisi Warehouse"],
            ["Status PPIC", STATUS_PPIC_LABEL[produk.statusPpic]],
          ]}
        />
      </div>

      <DesainPreviewSection desainLink={produk.desainLink} polaKemejaLink={produk.polaKemejaLink} />

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Ubah Status Marketing
        </h2>
        <div className="mt-3">
          {canEdit ? (
            <StatusTransitionForm
              produkId={produk.id}
              currentStatus={produk.statusMarketing}
              statusLabel={STATUS_MARKETING_LABEL}
              transitions={transitions}
              action={updateStatusMarketing}
              finalMessage="Produk sudah Launch — proses selesai."
            />
          ) : (
            <NoAccessNotice divisi={Divisi.MARKETING} />
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Input Marketing
        </h2>
        <div className="mt-3">
          {canEdit ? <ProdukEditFormMarketing produk={produk} /> : <NoAccessNotice divisi={Divisi.MARKETING} />}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Riwayat Status
        </h2>
        <div className="mt-3">
          <RiwayatTimeline riwayat={produk.riwayatStatus} />
        </div>
      </section>
    </main>
  );
}
