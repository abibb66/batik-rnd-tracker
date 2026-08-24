import { prisma } from "@/lib/prisma";
import { getSession, canManage } from "@/lib/auth";
import { Divisi } from "@/generated/prisma/client";
import { NoAccessNotice } from "@/components/NoAccessNotice";
import { OpsiRow } from "@/components/OpsiRow";
import { OpsiCreateForm } from "@/components/OpsiCreateForm";
import type { DropdownGroup } from "@/lib/status";

const GROUPS: { grup: DropdownGroup; label: string }[] = [
  { grup: "KATEGORI", label: "Kategori" },
  { grup: "STATUS_RND", label: "Status RnD" },
  { grup: "STATUS_PPIC", label: "Status PPIC" },
  { grup: "STATUS_WAREHOUSE", label: "Status Warehouse" },
  { grup: "STATUS_MARKETING", label: "Status Marketing" },
];

export default async function OpsiAdminPage() {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.ADMIN)) {
    return (
      <main className="mx-auto max-w-3xl px-8 py-12">
        <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Pengaturan Dropdown</h1>
        <div className="mt-4">
          <NoAccessNotice divisi={Divisi.ADMIN} />
        </div>
      </main>
    );
  }

  const allOptions = await prisma.dropdownOption.findMany({ orderBy: { urutan: "asc" } });

  return (
    <main className="mx-auto max-w-3xl px-8 py-12">
      <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Pengaturan Dropdown</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Kelola pilihan Kategori & Status per divisi. Perubahan di sini langsung berlaku di semua form dan halaman,
        tanpa perlu update kode.
      </p>

      <div className="mt-8 space-y-8">
        {GROUPS.map(({ grup, label }) => {
          const options = allOptions.filter((o) => o.grup === grup);
          return (
            <section key={grup}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {label}
              </h2>
              <div className="card mt-2">
                {options.length === 0 && (
                  <p className="px-3 py-3 text-sm text-zinc-500 dark:text-zinc-400">Belum ada opsi.</p>
                )}
                {options.map((o, i) => (
                  <OpsiRow
                    key={o.id}
                    id={o.id}
                    nilai={o.nilai}
                    label={o.label}
                    aktif={o.aktif}
                    isFirst={i === 0}
                    isLast={i === options.length - 1}
                  />
                ))}
                <OpsiCreateForm grup={grup} />
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
