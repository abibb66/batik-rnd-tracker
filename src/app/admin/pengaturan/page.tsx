import { getSession, canManage } from "@/lib/auth";
import { Divisi } from "@/generated/prisma/client";
import { NoAccessNotice } from "@/components/NoAccessNotice";
import { getSiteSettings } from "@/lib/settings";
import { SiteSettingsForm } from "@/components/SiteSettingsForm";

export default async function PengaturanPage() {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.ADMIN)) {
    return (
      <main className="mx-auto max-w-3xl px-8 py-12">
        <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Pengaturan Situs</h1>
        <div className="mt-4">
          <NoAccessNotice divisi={Divisi.ADMIN} />
        </div>
      </main>
    );
  }

  const settings = await getSiteSettings();

  return (
    <main className="mx-auto max-w-3xl px-8 py-12">
      <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Pengaturan Situs</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Ganti nama situs dan logo yang tampil di header. Berlaku untuk semua pengguna, tidak perlu update kode.
      </p>

      <SiteSettingsForm namaSitus={settings.namaSitus} logoUrl={settings.logoUrl} />
    </main>
  );
}
