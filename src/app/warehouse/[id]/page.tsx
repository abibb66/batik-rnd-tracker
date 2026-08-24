import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTransitionForm } from "@/components/StatusTransitionForm";
import { ProdukEditFormWarehouse } from "@/components/ProdukEditFormWarehouse";
import { RiwayatTimeline } from "@/components/RiwayatTimeline";
import { RndContextCard } from "@/components/RndContextCard";
import { NoAccessNotice } from "@/components/NoAccessNotice";
import { DesainPreviewSection } from "@/components/DesainPreviewSection";
import { getDropdownLabelMap, getDropdownOptions, buildTransitions } from "@/lib/status";
import { updateStatusWarehouse } from "@/app/warehouse/actions";
import { getSession, canManage } from "@/lib/auth";
import { Divisi } from "@/generated/prisma/client";

export default async function WarehouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [produk, session, kategoriLabelMap, STATUS_WAREHOUSE_LABEL, statusWarehouseOptions] = await Promise.all([
    prisma.produk.findUnique({
      where: { id },
      include: { riwayatStatus: { orderBy: { timestamp: "desc" }, include: { diubahOleh: true } } },
    }),
    getSession(),
    getDropdownLabelMap("KATEGORI"),
    getDropdownLabelMap("STATUS_WAREHOUSE"),
    getDropdownOptions("STATUS_WAREHOUSE"),
  ]);

  if (!produk) notFound();
  if (produk.statusRnd !== "PO_KAIN") {
    return (
      <main className="mx-auto max-w-3xl px-8 py-12">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Produk {produk.kodeProduk} belum PO Kain di RnD, belum bisa dikerjakan Warehouse.
        </p>
      </main>
    );
  }
  const canEdit = canManage(session, Divisi.WAREHOUSE);
  const transitions = buildTransitions(statusWarehouseOptions, produk.statusWarehouse);

  return (
    <main className="mx-auto max-w-3xl px-8 py-12">
      <div className="flex items-center gap-3">
        <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{produk.kodeProduk}</h1>
        <StatusBadge label={STATUS_WAREHOUSE_LABEL[produk.statusWarehouse]} status={produk.statusWarehouse} />
      </div>

      <div className="mt-4">
        <RndContextCard produk={produk} kategoriLabelMap={kategoriLabelMap} />
      </div>

      <DesainPreviewSection desainLink={produk.desainLink} polaKemejaLink={produk.polaKemejaLink} />

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Ubah Status Warehouse
        </h2>
        <div className="mt-3">
          {canEdit ? (
            <StatusTransitionForm
              produkId={produk.id}
              currentStatus={produk.statusWarehouse}
              statusLabel={STATUS_WAREHOUSE_LABEL}
              transitions={transitions}
              action={updateStatusWarehouse}
              finalMessage="Ready to Launch tercapai — produk ini sekarang muncul di Dashboard Marketing."
            />
          ) : (
            <NoAccessNotice divisi={Divisi.WAREHOUSE} />
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Input Warehouse
        </h2>
        <div className="mt-3">
          {canEdit ? <ProdukEditFormWarehouse produk={produk} /> : <NoAccessNotice divisi={Divisi.WAREHOUSE} />}
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
