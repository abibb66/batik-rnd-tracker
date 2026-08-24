"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Divisi } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth";

export type DeleteProdukState = { error?: string };

const deleteProdukSchema = z.object({ produkId: z.string().min(1) });

export async function deleteProduk(
  _prevState: DeleteProdukState,
  formData: FormData
): Promise<DeleteProdukState> {
  const session = await getSession();
  if (!session || session.divisi !== Divisi.ADMIN) {
    return { error: "Hanya Admin yang bisa menghapus produk." };
  }

  const parsed = deleteProdukSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Data tidak valid." };
  }

  const produk = await prisma.produk.findUnique({ where: { id: parsed.data.produkId } });
  if (!produk) return { error: "Produk tidak ditemukan." };

  await prisma.produk.delete({ where: { id: produk.id } });

  revalidatePath("/");
  revalidatePath("/rnd");
  revalidatePath("/ppic");
  revalidatePath("/warehouse");
  revalidatePath("/marketing");
  revalidatePath("/statistik");
  redirect("/rnd");
}
