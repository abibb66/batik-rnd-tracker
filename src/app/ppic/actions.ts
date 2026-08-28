"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Divisi } from "@/generated/prisma/client";
import { isActiveDropdownValue } from "@/lib/status";
import { notifyReadyKain } from "@/lib/notify";
import { getSession, canManage } from "@/lib/auth";

function toDateOrNull(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  return new Date(value);
}

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

export async function updateStatusPpic(
  _prevState: UpdateStatusState,
  formData: FormData
): Promise<UpdateStatusState> {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.PPIC)) {
    return { error: "Hanya PIC PPIC atau Admin yang bisa mengubah status ini." };
  }

  const parsed = updateStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Data status tidak valid." };
  const { produkId, statusKe, catatan } = parsed.data;

  const produk = await prisma.produk.findUnique({ where: { id: produkId } });
  if (!produk) return { error: "Produk tidak ditemukan." };
  if (produk.statusRnd !== "PO_KAIN") {
    return { error: "Produk belum mencapai status PO Kain di RnD." };
  }

  if (statusKe === produk.statusPpic || !(await isActiveDropdownValue("STATUS_PPIC", statusKe))) {
    return { error: `Status "${statusKe}" tidak valid.` };
  }

  await prisma.$transaction([
    prisma.produk.update({ where: { id: produkId }, data: { statusPpic: statusKe } }),
    prisma.riwayatStatus.create({
      data: {
        produkId,
        divisi: Divisi.PPIC,
        statusDari: produk.statusPpic,
        statusKe,
        diubahOlehId: session.userId,
        catatan: toStringOrNull(catatan ?? null),
      },
    }),
  ]);

  if (statusKe === "READY_KAIN") {
    await notifyReadyKain(produk);
  }

  revalidatePath("/ppic");
  revalidatePath(`/ppic/${produkId}`);
  revalidatePath("/marketing");
  return {};
}

const updateDetailSchema = z.object({
  produkId: z.string().min(1),
  tanggalMasukVendor: z.string().optional(),
  estimasiJadi: z.string().optional(),
  kendalaPpic: z.string().trim().optional(),
  redirectTo: z.string().optional(),
});

export type UpdateDetailState = { error?: string };

export async function updateProdukDetailPpic(
  _prevState: UpdateDetailState,
  formData: FormData
): Promise<UpdateDetailState> {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.PPIC)) {
    return { error: "Hanya PIC PPIC atau Admin yang bisa mengubah detail ini." };
  }

  const parsed = updateDetailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Periksa kembali isian form." };
  const data = parsed.data;

  await prisma.produk.update({
    where: { id: data.produkId },
    data: {
      tanggalMasukVendor: toDateOrNull(data.tanggalMasukVendor ?? null),
      estimasiJadi: toDateOrNull(data.estimasiJadi ?? null),
      kendalaPpic: toStringOrNull(data.kendalaPpic ?? null),
    },
  });

  revalidatePath("/ppic");
  revalidatePath(`/ppic/${data.produkId}`);
  revalidatePath("/");
  redirect(data.redirectTo && data.redirectTo.startsWith("/") ? data.redirectTo : "/");
}
