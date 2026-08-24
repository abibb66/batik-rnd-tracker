"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Divisi } from "@/generated/prisma/client";
import { isActiveDropdownValue } from "@/lib/status";
import { notifyPoKain } from "@/lib/notify";
import { getSession, canManage } from "@/lib/auth";

function toDateOrNull(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  return new Date(value);
}

function toStringOrNull(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

const createProdukSchema = z.object({
  kodeProduk: z.string().trim().min(1, "Kode produk wajib diisi"),
  kategori: z.string().trim().min(1, "Kategori wajib diisi"),
  vendor: z.string().trim().min(1, "Vendor wajib diisi"),
  uspWarna: z.string().trim().optional(),
  tanggalMulai: z.string().optional(),
  planLaunching: z.string().optional(),
  desainLink: z.string().trim().optional(),
  polaKemejaLink: z.string().trim().optional(),
  driveFolderLink: z.string().trim().optional(),
  catatan: z.string().trim().optional(),
});

export type CreateProdukState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createProduk(
  _prevState: CreateProdukState,
  formData: FormData
): Promise<CreateProdukState> {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.RND)) {
    return { error: "Hanya PIC RnD atau Admin yang bisa menambah produk." };
  }

  const parsed = createProdukSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") fieldErrors[key] = issue.message;
    }
    return { error: "Periksa kembali isian form.", fieldErrors };
  }
  const data = parsed.data;

  if (!(await isActiveDropdownValue("KATEGORI", data.kategori))) {
    return { error: "Kategori tidak valid.", fieldErrors: { kategori: "Kategori tidak valid" } };
  }

  const existing = await prisma.produk.findUnique({ where: { kodeProduk: data.kodeProduk } });
  if (existing) {
    return { error: "Kode produk sudah dipakai.", fieldErrors: { kodeProduk: "Kode produk sudah dipakai" } };
  }

  const produk = await prisma.produk.create({
    data: {
      kodeProduk: data.kodeProduk,
      kategori: data.kategori,
      vendor: data.vendor,
      uspWarna: toStringOrNull(data.uspWarna ?? null),
      tanggalMulai: toDateOrNull(data.tanggalMulai ?? null),
      planLaunching: toDateOrNull(data.planLaunching ?? null),
      desainLink: toStringOrNull(data.desainLink ?? null),
      polaKemejaLink: toStringOrNull(data.polaKemejaLink ?? null),
      driveFolderLink: toStringOrNull(data.driveFolderLink ?? null),
      statusRnd: "ACC_DESAIN",
      riwayatStatus: {
        create: {
          divisi: Divisi.RND,
          statusDari: null,
          statusKe: "ACC_DESAIN",
          diubahOlehId: session.userId,
          catatan: toStringOrNull(data.catatan ?? null) ?? "Produk dibuat, desain ACC dan mulai di-tracking.",
        },
      },
    },
  });

  revalidatePath("/rnd");
  redirect(`/rnd/${produk.id}`);
}

const updateStatusSchema = z.object({
  produkId: z.string().min(1),
  statusKe: z.string().min(1),
  catatan: z.string().trim().optional(),
});

export type UpdateStatusState = { error?: string };

export async function updateStatusRnd(
  _prevState: UpdateStatusState,
  formData: FormData
): Promise<UpdateStatusState> {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.RND)) {
    return { error: "Hanya PIC RnD atau Admin yang bisa mengubah status ini." };
  }

  const parsed = updateStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Data status tidak valid." };
  }
  const { produkId, statusKe, catatan } = parsed.data;

  const produk = await prisma.produk.findUnique({ where: { id: produkId } });
  if (!produk) return { error: "Produk tidak ditemukan." };

  if (statusKe === produk.statusRnd || !(await isActiveDropdownValue("STATUS_RND", statusKe))) {
    return { error: `Status "${statusKe}" tidak valid.` };
  }

  await prisma.$transaction([
    prisma.produk.update({ where: { id: produkId }, data: { statusRnd: statusKe } }),
    prisma.riwayatStatus.create({
      data: {
        produkId,
        divisi: Divisi.RND,
        statusDari: produk.statusRnd,
        statusKe,
        diubahOlehId: session.userId,
        catatan: toStringOrNull(catatan ?? null),
      },
    }),
  ]);

  if (statusKe === "PO_KAIN") {
    await notifyPoKain(produk);
  }

  revalidatePath("/rnd");
  revalidatePath(`/rnd/${produkId}`);
  revalidatePath("/ppic");
  revalidatePath("/warehouse");
  return {};
}

const updateDetailSchema = z.object({
  produkId: z.string().min(1),
  kategori: z.string().trim().min(1, "Kategori wajib diisi"),
  vendor: z.string().trim().min(1, "Vendor wajib diisi"),
  uspWarna: z.string().trim().optional(),
  tanggalMulai: z.string().optional(),
  planLaunching: z.string().optional(),
  desainLink: z.string().trim().optional(),
  polaKemejaLink: z.string().trim().optional(),
  driveFolderLink: z.string().trim().optional(),
});

export type UpdateDetailState = { error?: string };

export async function updateProdukDetail(
  _prevState: UpdateDetailState,
  formData: FormData
): Promise<UpdateDetailState> {
  const session = await getSession();
  if (!session || !canManage(session, Divisi.RND)) {
    return { error: "Hanya PIC RnD atau Admin yang bisa mengubah detail ini." };
  }

  const parsed = updateDetailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Periksa kembali isian form." };
  }
  const data = parsed.data;

  if (!(await isActiveDropdownValue("KATEGORI", data.kategori))) {
    return { error: "Kategori tidak valid." };
  }

  await prisma.produk.update({
    where: { id: data.produkId },
    data: {
      kategori: data.kategori,
      vendor: data.vendor,
      uspWarna: toStringOrNull(data.uspWarna ?? null),
      tanggalMulai: toDateOrNull(data.tanggalMulai ?? null),
      planLaunching: toDateOrNull(data.planLaunching ?? null),
      desainLink: toStringOrNull(data.desainLink ?? null),
      polaKemejaLink: toStringOrNull(data.polaKemejaLink ?? null),
      driveFolderLink: toStringOrNull(data.driveFolderLink ?? null),
    },
  });

  revalidatePath("/rnd");
  revalidatePath(`/rnd/${data.produkId}`);
  return {};
}
