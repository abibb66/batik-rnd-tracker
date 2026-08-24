"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Divisi } from "@/generated/prisma/client";
import { isActiveDropdownValue, isDropdownValueAtLeast } from "@/lib/status";
import { notifyLaunch } from "@/lib/notify";
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

export async function updateStatusMarketing(
  _prevState: UpdateStatusState,
  formData: FormData
): Promise<UpdateStatusState> {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.MARKETING)) {
    return { error: "Hanya PIC Marketing atau Admin yang bisa mengubah status ini." };
  }

  const parsed = updateStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Data status tidak valid." };
  const { produkId, statusKe, catatan } = parsed.data;

  const produk = await prisma.produk.findUnique({ where: { id: produkId } });
  if (!produk) return { error: "Produk tidak ditemukan." };
  if (!(await isDropdownValueAtLeast("STATUS_PPIC", produk.statusPpic, "READY_KAIN"))) {
    return { error: "PPIC belum Ready Kain, Marketing belum bisa mulai." };
  }

  if (statusKe === produk.statusMarketing || !(await isActiveDropdownValue("STATUS_MARKETING", statusKe))) {
    return { error: `Status "${statusKe}" tidak valid.` };
  }
  if (statusKe === "PRODUKSI_KONTEN" && !produk.namaMotif) {
    return { error: "Isi nama motif dulu di Detail Produk sebelum mulai produksi konten." };
  }

  await prisma.$transaction([
    prisma.produk.update({ where: { id: produkId }, data: { statusMarketing: statusKe } }),
    prisma.riwayatStatus.create({
      data: {
        produkId,
        divisi: Divisi.MARKETING,
        statusDari: produk.statusMarketing,
        statusKe,
        diubahOlehId: session.userId,
        catatan: toStringOrNull(catatan ?? null),
      },
    }),
  ]);

  if (statusKe === "LAUNCH") {
    await notifyLaunch(produk);
  }

  revalidatePath("/marketing");
  revalidatePath(`/marketing/${produkId}`);
  return {};
}

const updateDetailSchema = z.object({
  produkId: z.string().min(1),
  namaMotif: z.string().trim().optional(),
  filosofiMotif: z.string().trim().optional(),
  linkMarketplace: z.string().trim().optional(),
  kendalaMarketing: z.string().trim().optional(),
});

export type UpdateDetailState = { error?: string };

export async function updateProdukDetailMarketing(
  _prevState: UpdateDetailState,
  formData: FormData
): Promise<UpdateDetailState> {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.MARKETING)) {
    return { error: "Hanya PIC Marketing atau Admin yang bisa mengubah detail ini." };
  }

  const parsed = updateDetailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Periksa kembali isian form." };
  const data = parsed.data;

  await prisma.produk.update({
    where: { id: data.produkId },
    data: {
      namaMotif: toStringOrNull(data.namaMotif ?? null),
      filosofiMotif: toStringOrNull(data.filosofiMotif ?? null),
      linkMarketplace: toStringOrNull(data.linkMarketplace ?? null),
      kendalaMarketing: toStringOrNull(data.kendalaMarketing ?? null),
    },
  });

  revalidatePath("/marketing");
  revalidatePath(`/marketing/${data.produkId}`);
  return {};
}
