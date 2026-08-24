"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Divisi } from "@/generated/prisma/client";
import { isActiveDropdownValue } from "@/lib/status";
import { notifyReadyToLaunch } from "@/lib/notify";
import { getSession, canManage } from "@/lib/auth";

function toStringOrNull(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

const updateStatusSchema = z.object({
  produkId: z.string().min(1),
  statusKe: z.string().min(1),
  catatan: z.string().trim().optional(),
});

export type UpdateStatusState = { error?: string };

export async function updateStatusWarehouse(
  _prevState: UpdateStatusState,
  formData: FormData
): Promise<UpdateStatusState> {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.WAREHOUSE)) {
    return { error: "Hanya PIC Warehouse atau Admin yang bisa mengubah status ini." };
  }

  const parsed = updateStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Data status tidak valid." };
  const { produkId, statusKe, catatan } = parsed.data;

  const produk = await prisma.produk.findUnique({ where: { id: produkId } });
  if (!produk) return { error: "Produk tidak ditemukan." };
  if (produk.statusRnd !== "PO_KAIN") {
    return { error: "Produk belum mencapai status PO Kain di RnD." };
  }

  if (statusKe === produk.statusWarehouse || !(await isActiveDropdownValue("STATUS_WAREHOUSE", statusKe))) {
    return { error: `Status "${statusKe}" tidak valid.` };
  }
  if (statusKe === "INPUT_SKU" && !produk.sku) {
    return { error: "Isi SKU dulu di Detail Produk sebelum pindah ke status Input SKU." };
  }

  await prisma.$transaction([
    prisma.produk.update({ where: { id: produkId }, data: { statusWarehouse: statusKe } }),
    prisma.riwayatStatus.create({
      data: {
        produkId,
        divisi: Divisi.WAREHOUSE,
        statusDari: produk.statusWarehouse,
        statusKe,
        diubahOlehId: session.userId,
        catatan: toStringOrNull(catatan ?? null),
      },
    }),
  ]);

  if (statusKe === "READY_TO_LAUNCH") {
    await notifyReadyToLaunch(produk);
  }

  revalidatePath("/warehouse");
  revalidatePath(`/warehouse/${produkId}`);
  revalidatePath("/marketing");
  return {};
}

const updateDetailSchema = z.object({
  produkId: z.string().min(1),
  sku: z.string().trim().optional(),
  stok: z.string().trim().optional(),
  kendalaWarehouse: z.string().trim().optional(),
});

export type UpdateDetailState = { error?: string };

export async function updateProdukDetailWarehouse(
  _prevState: UpdateDetailState,
  formData: FormData
): Promise<UpdateDetailState> {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.WAREHOUSE)) {
    return { error: "Hanya PIC Warehouse atau Admin yang bisa mengubah detail ini." };
  }

  const parsed = updateDetailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Periksa kembali isian form." };
  const data = parsed.data;

  const stokValue = data.stok && data.stok.trim() !== "" ? Number(data.stok) : null;
  if (data.stok && data.stok.trim() !== "" && (stokValue === null || Number.isNaN(stokValue))) {
    return { error: "Stok harus berupa angka." };
  }

  await prisma.produk.update({
    where: { id: data.produkId },
    data: {
      sku: toStringOrNull(data.sku ?? null),
      stok: stokValue,
      kendalaWarehouse: toStringOrNull(data.kendalaWarehouse ?? null),
    },
  });

  revalidatePath("/warehouse");
  revalidatePath(`/warehouse/${data.produkId}`);
  return {};
}
