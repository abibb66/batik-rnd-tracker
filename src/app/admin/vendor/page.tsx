import { prisma } from "@/lib/prisma";
import { getSession, canManage } from "@/lib/auth";
import { Divisi } from "@/generated/prisma/client";
import { NoAccessNotice } from "@/components/NoAccessNotice";
import { VendorRow } from "@/components/VendorRow";
import { VendorCreateForm } from "@/components/VendorCreateForm";

export default async function VendorAdminPage() {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.ADMIN)) {
    return (
      <main className="mx-auto max-w-3xl px-8 py-12">
        <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Vendor</h1>
        <div className="mt-4">
          <NoAccessNotice divisi={Divisi.ADMIN} />
        </div>
      </main>
    );
  }

  const vendors = await prisma.vendor.findMany({ orderBy: { nama: "asc" } });

  return (
    <main className="mx-auto max-w-3xl px-8 py-12">
      <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Vendor</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Atur lead time (hari) tiap vendor. Begitu status RnD sebuah produk jadi PO Kain, Estimasi Ready
        Stok dihitung otomatis dari tanggal itu + lead time vendornya, dan Plan Launching mengikuti 7
        hari setelahnya — hanya mengisi kolom yang masih kosong, tidak menimpa yang sudah diisi manual.
      </p>

      <div className="card mt-6">
        {vendors.length === 0 && (
          <p className="px-3 py-3 text-sm text-zinc-500 dark:text-zinc-400">Belum ada vendor.</p>
        )}
        {vendors.map((v) => (
          <VendorRow key={v.id} id={v.id} nama={v.nama} leadTimeHari={v.leadTimeHari} aktif={v.aktif} />
        ))}
        <VendorCreateForm />
      </div>
    </main>
  );
}
