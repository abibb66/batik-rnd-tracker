import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTransitionForm } from "@/components/StatusTransitionForm";
import { ProdukEditForm } from "@/components/ProdukEditForm";
import { RiwayatTimeline } from "@/components/RiwayatTimeline";
import { NoAccessNotice } from "@/components/NoAccessNotice";
import { DesainPreviewSection } from "@/components/DesainPreviewSection";
import { DeleteProdukButton } from "@/components/DeleteProdukButton";
import { getDropdownLabelMap, getDropdownOptions, buildTransitions } from "@/lib/status";
import { updateStatusRnd } from "@/app/rnd/actions";
import { getSession, canManage } from "@/lib/auth";
import { Divisi } from "@/generated/prisma/client";

export default async function ProdukDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [produk, session, KATEGORI_LABEL, STATUS_RND_LABEL, statusRndOptions] = await Promise.all([
    prisma.produk.findUnique({
      where: { id },
      include: { riwayatStatus: { orderBy: { timestamp: "desc" }, include: { diubahOleh: true } } },
    }),
    getSession(),
    getDropdownLabelMap("KATEGORI"),
    getDropdownLabelMap("STATUS_RND"),
    getDropdownOptions("STATUS_RND"),
  ]);

  if (!produk) notFound();
  const canEdit = canManage(session, Divisi.RND);
  const transitions = buildTransitions(statusRndOptions, produk.statusRnd);

  return (
    <main className="mx-auto max-w-3xl px-8 py-12">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{produk.kodeProduk}</h1>
          <StatusBadge label={STATUS_RND_LABEL[produk.statusRnd]} status={produk.statusRnd} />
        </div>
        {session?.divisi === Divisi.ADMIN && (
          <DeleteProdukButton produkId={produk.id} kodeProduk={produk.kodeProduk} />
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {produk.kategori ? KATEGORI_LABEL[produk.kategori] : "Tanpa kategori"} · {produk.vendor ?? "Tanpa vendor"}
      </p>

      <DesainPreviewSection desainLink={produk.desainLink} polaKemejaLink={produk.polaKemejaLink} />

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Ubah Status RnD
        </h2>
        <div className="mt-3">
          {canEdit ? (
            <StatusTransitionForm
              produkId={produk.id}
              currentStatus={produk.statusRnd}
              statusLabel={STATUS_RND_LABEL}
              transitions={transitions}
              action={updateStatusRnd}
              finalMessage={`Tidak ada status aktif lain untuk dipilih di RnD.`}
            />
          ) : (
            <NoAccessNotice divisi={Divisi.RND} />
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Detail Produk
        </h2>
        <div className="mt-3">
          {canEdit ? (
            <ProdukEditForm produk={produk} kategoriLabelMap={KATEGORI_LABEL} />
          ) : (
            <NoAccessNotice divisi={Divisi.RND} />
          )}
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
