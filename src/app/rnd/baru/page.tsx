import { ProdukForm } from "@/components/ProdukForm";
import { NoAccessNotice } from "@/components/NoAccessNotice";
import { getSession, canManage } from "@/lib/auth";
import { getDropdownLabelMap } from "@/lib/status";
import { Divisi } from "@/generated/prisma/client";

export default async function ProdukBaruPage() {
  const [session, kategoriLabelMap] = await Promise.all([getSession(), getDropdownLabelMap("KATEGORI")]);
  const canCreate = canManage(session, Divisi.RND);

  return (
    <main className="mx-auto max-w-3xl px-8 py-12">
      <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Produk Baru</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        File desain sudah ACC — produk mulai di-tracking dari sini dengan status awal ACC Desain.
      </p>
      {canCreate ? (
        <ProdukForm kategoriLabelMap={kategoriLabelMap} />
      ) : (
        <div className="mt-6">
          <NoAccessNotice divisi={Divisi.RND} />
        </div>
      )}
    </main>
  );
}
