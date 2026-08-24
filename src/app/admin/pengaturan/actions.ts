"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { Divisi } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth";
import { getSiteSettings, SETTINGS_ID } from "@/lib/settings";

export type SettingsState = { error?: string; success?: boolean };

const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

const schema = z.object({
  namaSitus: z.string().trim().min(1, "Nama situs wajib diisi"),
  hapusLogo: z.string().optional(),
});

export async function updateSiteSettings(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const session = await getSession();
  if (!session || session.divisi !== Divisi.ADMIN) {
    return { error: "Hanya Admin yang bisa mengubah pengaturan situs." };
  }

  const parsed = schema.safeParse({
    namaSitus: formData.get("namaSitus"),
    hapusLogo: formData.get("hapusLogo") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Periksa kembali isian form." };
  }

  const current = await getSiteSettings();
  let logoUrl = current.logoUrl;

  const file = formData.get("logo");
  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: "Format logo harus PNG, JPG, WEBP, atau SVG." };
    }
    if (file.size > MAX_LOGO_SIZE) {
      return { error: "Ukuran logo maksimal 2MB." };
    }
    const blob = await put(`logo/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    if (current.logoUrl) {
      await del(current.logoUrl).catch(() => {});
    }
    logoUrl = blob.url;
  } else if (parsed.data.hapusLogo === "on") {
    if (current.logoUrl) {
      await del(current.logoUrl).catch(() => {});
    }
    logoUrl = null;
  }

  await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, namaSitus: parsed.data.namaSitus, logoUrl },
    update: { namaSitus: parsed.data.namaSitus, logoUrl },
  });

  revalidatePath("/", "layout");
  return { success: true };
}
