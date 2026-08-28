"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Divisi } from "@/generated/prisma/client";
import { getSession, canManage, hashPassword } from "@/lib/auth";

export type AkunState = { error?: string };

async function requireAdmin() {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.ADMIN)) {
    return { session: null, denied: { error: "Hanya Admin yang bisa mengubah akun." } as AkunState };
  }
  return { session, denied: null };
}

const divisiSchema = z.enum(["RND", "PPIC", "WAREHOUSE", "MARKETING", "ADMIN", "VISITOR"]);

const createSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi"),
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  divisi: divisiSchema,
});

export async function createUser(_prevState: AkunState, formData: FormData): Promise<AkunState> {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Periksa kembali isian form." };
  const { nama, email, password, divisi } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email sudah dipakai akun lain." };

  const passwordHash = await hashPassword(password);
  await prisma.user.create({ data: { nama, email, passwordHash, divisi } });

  revalidatePath("/admin/akun");
  return {};
}

const updateAksesSchema = z.object({
  id: z.string().min(1),
  nama: z.string().trim().min(1, "Nama wajib diisi"),
  divisi: divisiSchema,
});

export async function updateUserAkses(_prevState: AkunState, formData: FormData): Promise<AkunState> {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const parsed = updateAksesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Periksa kembali isian form." };
  const { id, nama, divisi } = parsed.data;

  await prisma.user.update({ where: { id }, data: { nama, divisi } });

  revalidatePath("/admin/akun");
  return {};
}

const resetPasswordSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export async function resetUserPassword(_prevState: AkunState, formData: FormData): Promise<AkunState> {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Password tidak valid." };
  const { id, password } = parsed.data;

  const passwordHash = await hashPassword(password);
  await prisma.user.update({ where: { id }, data: { passwordHash } });

  revalidatePath("/admin/akun");
  return {};
}

const toggleSchema = z.object({ id: z.string().min(1) });

export async function toggleUserActive(_prevState: AkunState, formData: FormData): Promise<AkunState> {
  const { session, denied } = await requireAdmin();
  if (denied) return denied;

  const parsed = toggleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Data tidak valid." };

  const target = await prisma.user.findUnique({ where: { id: parsed.data.id } });
  if (!target) return { error: "Akun tidak ditemukan." };

  if (target.aktif) {
    if (target.id === session!.userId) {
      return { error: "Tidak bisa menonaktifkan akun sendiri." };
    }
    if (target.divisi === Divisi.ADMIN) {
      const jumlahAdminAktif = await prisma.user.count({ where: { divisi: Divisi.ADMIN, aktif: true } });
      if (jumlahAdminAktif <= 1) {
        return { error: "Tidak bisa menonaktifkan — ini satu-satunya akun Admin aktif." };
      }
    }
  }

  await prisma.user.update({ where: { id: target.id }, data: { aktif: !target.aktif } });

  revalidatePath("/admin/akun");
  return {};
}
