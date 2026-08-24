import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTransitionForm } from "@/components/StatusTransitionForm";
import { ProdukEditFormPpic } from "@/components/ProdukEditFormPpic";
import { RiwayatTimeline } from "@/components/RiwayatTimeline";
import { RndContextCard } from "@/components/RndContextCard";
import { NoAccessNotice } from "@/components/NoAccessNotice";
import { DesainPreviewSection } from "@/components/DesainPreviewSection";
import { getDropdownLabelMap, getDropdownOptions, buildTransitions } from "@/lib/status";
import { updateStatusPpic } from "@/app/ppic/actions";
import { getSession, canManage } from "@/lib/auth";
import { Divisi } from "@/generated/prisma/client";

export default async function PpicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [produk, session, kategoriLabelMap, STATUS_PPIC_LABEL, statusPpicOptions] = await Promise.all([
    prisma.produk.findUnique({
      where: { id },
      include: { riwayatStatus: { orderBy: { timestamp: "desc" }, include: { diubahOleh: true } } },
    }),
    getSession(),
    getDropdownLabelMap("KATEGORI"),
    getDropdownLabelMap("STATUS_PPIC"),
    getDropdownOptions("STATUS_PPIC"),
  ]);

  if (!produk) notFound();
  if (produk.statusRnd !== "PO_KAIN") {
    return (
      <main className="mx-auto max-w-3xl px-8 py-12">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Produk {produk.kodeProduk} belum PO Kain di RnD, belum bisa dikerjakan PPIC.
        </p>
      </main>
    );
  }
  const canEdit = canManage(session, Divisi.PPIC);
  const transitions = buildTransitions(statusPpicOptions, produk.statusPpic);

  return (
    <main className="mx-auto max-w-3xl px-8 py-12">
      <div className="flex items-center gap-3">
        <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{produk.kodeProduk}</h1>
        <StatusBadge label={STATUS_PPIC_LABEL[produk.statusPpic]} status={produk.statusPpic} />
      </div>

      <div className="mt-4">
        <RndContextCard produk={produk} kategoriLabelMap={kategoriLabelMap} />
      </div>

      <DesainPreviewSection desainLink={produk.desainLink} polaKemejaLink={produk.polaKemejaLink} />

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Ubah Status PPIC
        </h2>
        <div className="mt-3">
          {canEdit ? (
            <StatusTransitionForm
              produkId={produk.id}
              currentStatus={produk.statusPpic}
              statusLabel={STATUS_PPIC_LABEL}
              transitions={transitions}
              action={updateStatusPpic}
              finalMessage="Tidak ada status aktif lain untuk dipilih di PPIC."
            />
          ) : (
            <NoAccessNotice divisi={Divisi.PPIC} />
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Input PPIC
        </h2>
        <div className="mt-3">
          {canEdit ? <ProdukEditFormPpic produk={produk} /> : <NoAccessNotice divisi={Divisi.PPIC} />}
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
