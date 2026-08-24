"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Divisi } from "@/generated/prisma/client";
import { getSession, canManage } from "@/lib/auth";
import type { DropdownGroup } from "@/lib/status";

export type OpsiState = { error?: string };

function deriveNilai(label: string) {
  return label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function countProdukUsingValue(grup: DropdownGroup, nilai: string) {
  switch (grup) {
    case "KATEGORI":
      return prisma.produk.count({ where: { kategori: nilai } });
    case "STATUS_RND":
      return prisma.produk.count({ where: { statusRnd: nilai } });
    case "STATUS_PPIC":
      return prisma.produk.count({ where: { statusPpic: nilai } });
    case "STATUS_WAREHOUSE":
      return prisma.produk.count({ where: { statusWarehouse: nilai } });
    case "STATUS_MARKETING":
      return prisma.produk.count({ where: { statusMarketing: nilai } });
  }
}

async function requireAdmin(): Promise<OpsiState | null> {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.ADMIN)) {
    return { error: "Hanya Admin yang bisa mengubah pengaturan ini." };
  }
  return null;
}

const grupSchema = z.enum(["KATEGORI", "STATUS_RND", "STATUS_PPIC", "STATUS_WAREHOUSE", "STATUS_MARKETING"]);

const createSchema = z.object({
  grup: grupSchema,
  label: z.string().trim().min(1, "Label wajib diisi"),
});

export async function createDropdownOption(_prevState: OpsiState, formData: FormData): Promise<OpsiState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Periksa kembali isian form." };
  const { grup, label } = parsed.data;

  const nilai = deriveNilai(label);
  if (!nilai) return { error: "Label tidak valid." };

  const existing = await prisma.dropdownOption.findUnique({ where: { grup_nilai: { grup, nilai } } });
  if (existing) return { error: `Opsi dengan nilai "${nilai}" sudah ada di grup ini.` };

  const last = await prisma.dropdownOption.findFirst({ where: { grup }, orderBy: { urutan: "desc" } });

  await prisma.dropdownOption.create({
    data: { grup, nilai, label, urutan: (last?.urutan ?? -1) + 1 },
  });

  revalidatePath("/admin/opsi");
  return {};
}

const renameSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1, "Label wajib diisi"),
});

export async function renameDropdownOption(_prevState: OpsiState, formData: FormData): Promise<OpsiState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = renameSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Periksa kembali isian form." };

  await prisma.dropdownOption.update({ where: { id: parsed.data.id }, data: { label: parsed.data.label } });

  revalidatePath("/admin/opsi");
  return {};
}

const reorderSchema = z.object({
  id: z.string().min(1),
  arah: z.enum(["naik", "turun"]),
});

export async function reorderDropdownOption(_prevState: OpsiState, formData: FormData): Promise<OpsiState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = reorderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Data tidak valid." };
  const { id, arah } = parsed.data;

  const current = await prisma.dropdownOption.findUnique({ where: { id } });
  if (!current) return { error: "Opsi tidak ditemukan." };

  const neighbor = await prisma.dropdownOption.findFirst({
    where: {
      grup: current.grup,
      urutan: arah === "naik" ? { lt: current.urutan } : { gt: current.urutan },
    },
    orderBy: { urutan: arah === "naik" ? "desc" : "asc" },
  });
  if (!neighbor) return {};

  await prisma.$transaction([
    prisma.dropdownOption.update({ where: { id: current.id }, data: { urutan: neighbor.urutan } }),
    prisma.dropdownOption.update({ where: { id: neighbor.id }, data: { urutan: current.urutan } }),
  ]);

  revalidatePath("/admin/opsi");
  return {};
}

const toggleSchema = z.object({ id: z.string().min(1) });

export async function toggleDropdownOptionActive(_prevState: OpsiState, formData: FormData): Promise<OpsiState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = toggleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Data tidak valid." };

  const current = await prisma.dropdownOption.findUnique({ where: { id: parsed.data.id } });
  if (!current) return { error: "Opsi tidak ditemukan." };

  if (current.aktif) {
    const jumlahDipakai = await countProdukUsingValue(current.grup as DropdownGroup, current.nilai);
    if (jumlahDipakai > 0) {
      return { error: `Tidak bisa dinonaktifkan — masih dipakai ${jumlahDipakai} produk.` };
    }
  }

  await prisma.dropdownOption.update({ where: { id: current.id }, data: { aktif: !current.aktif } });

  revalidatePath("/admin/opsi");
  return {};
}

export async function deleteDropdownOption(_prevState: OpsiState, formData: FormData): Promise<OpsiState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = toggleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Data tidak valid." };

  const current = await prisma.dropdownOption.findUnique({ where: { id: parsed.data.id } });
  if (!current) return { error: "Opsi tidak ditemukan." };
  if (current.aktif) return { error: "Nonaktifkan dulu opsi ini sebelum menghapus permanen." };

  const jumlahDipakai = await countProdukUsingValue(current.grup as DropdownGroup, current.nilai);
  if (jumlahDipakai > 0) {
    return { error: `Tidak bisa dihapus — masih dipakai ${jumlahDipakai} produk.` };
  }

  await prisma.dropdownOption.delete({ where: { id: current.id } });

  revalidatePath("/admin/opsi");
  return {};
}
