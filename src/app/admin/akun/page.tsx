import { prisma } from "@/lib/prisma";
import { getSession, canManage } from "@/lib/auth";
import { Divisi } from "@/generated/prisma/client";
import { NoAccessNotice } from "@/components/NoAccessNotice";
import { AkunRow } from "@/components/AkunRow";
import { AkunCreateForm } from "@/components/AkunCreateForm";

export default async function AkunAdminPage() {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.ADMIN)) {
    return (
      <main className="mx-auto max-w-3xl px-8 py-12">
        <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Kelola Akun</h1>
        <div className="mt-4">
          <NoAccessNotice divisi={Divisi.ADMIN} />
        </div>
      </main>
    );
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <main className="mx-auto max-w-3xl px-8 py-12">
      <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Kelola Akun</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Tambah akun tim, atur divisi (menentukan akses ke halaman & aksi), reset password, atau nonaktifkan akun —
        tanpa perlu edit kode atau database manual.
      </p>

      <div className="card mt-8">
        {users.map((u) => (
          <AkunRow
            key={u.id}
            id={u.id}
            nama={u.nama}
            email={u.email}
            divisi={u.divisi}
            aktif={u.aktif}
            isSelf={u.id === session.userId}
          />
        ))}
        <AkunCreateForm />
      </div>
    </main>
  );
}
