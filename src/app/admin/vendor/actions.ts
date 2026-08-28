"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Divisi } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth";

export type VendorState = { error?: string };

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.divisi !== Divisi.ADMIN) {
    return { denied: { error: "Hanya Admin yang bisa mengubah data vendor." } as VendorState };
  }
  return { denied: null };
}

const createSchema = z.object({
  nama: z.string().trim().min(1, "Nama vendor wajib diisi"),
  leadTimeHari: z.coerce.number().int().min(0, "Lead time minimal 0 hari"),
});

export async function createVendor(_prevState: VendorState, formData: FormData): Promise<VendorState> {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Periksa kembali isian form." };

  const existing = await prisma.vendor.findUnique({ where: { nama: parsed.data.nama } });
  if (existing) return { error: "Vendor dengan nama itu sudah ada." };

  await prisma.vendor.create({ data: parsed.data });
  revalidatePath("/admin/vendor");
  return {};
}

const updateSchema = z.object({
  id: z.string().min(1),
  nama: z.string().trim().min(1, "Nama vendor wajib diisi"),
  leadTimeHari: z.coerce.number().int().min(0, "Lead time minimal 0 hari"),
});

export async function updateVendor(_prevState: VendorState, formData: FormData): Promise<VendorState> {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Periksa kembali isian form." };
  const { id, nama, leadTimeHari } = parsed.data;

  await prisma.vendor.update({ where: { id }, data: { nama, leadTimeHari } });
  revalidatePath("/admin/vendor");
  return {};
}

const toggleSchema = z.object({ id: z.string().min(1) });

export async function toggleVendorActive(_prevState: VendorState, formData: FormData): Promise<VendorState> {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const parsed = toggleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Data tidak valid." };

  const vendor = await prisma.vendor.findUnique({ where: { id: parsed.data.id } });
  if (!vendor) return { error: "Vendor tidak ditemukan." };

  await prisma.vendor.update({ where: { id: vendor.id }, data: { aktif: !vendor.aktif } });
  revalidatePath("/admin/vendor");
  return {};
}
