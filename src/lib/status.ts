import "server-only";
import { Divisi } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const DIVISI_LABEL: Record<Divisi, string> = {
  RND: "RnD",
  PPIC: "PPIC",
  WAREHOUSE: "Warehouse",
  MARKETING: "Marketing",
  ADMIN: "Admin",
  VISITOR: "Visitor",
};

// Kategori & status per divisi dulunya Prisma enum, sekarang baris
// DropdownOption yang bisa diedit lewat /admin/opsi tanpa perlu deploy ulang.
export type DropdownGroup =
  | "KATEGORI"
  | "STATUS_RND"
  | "STATUS_PPIC"
  | "STATUS_WAREHOUSE"
  | "STATUS_MARKETING";

export async function getDropdownOptions(grup: DropdownGroup, includeInactive = false) {
  return prisma.dropdownOption.findMany({
    where: includeInactive ? { grup } : { grup, aktif: true },
    orderBy: { urutan: "asc" },
  });
}

export async function getDropdownLabelMap(grup: DropdownGroup): Promise<Record<string, string>> {
  const options = await getDropdownOptions(grup, true);
  return Object.fromEntries(options.map((o) => [o.nilai, o.label]));
}

export async function isActiveDropdownValue(grup: DropdownGroup, nilai: string): Promise<boolean> {
  const found = await prisma.dropdownOption.findUnique({ where: { grup_nilai: { grup, nilai } } });
  return !!found && found.aktif;
}

// Cek apakah `nilai` sudah mencapai (atau melewati) `ambang` berdasarkan urutan
// di grup itu — dipakai untuk gerbang lintas-divisi (mis. Marketing boleh mulai
// begitu status PPIC sudah Ready Kain atau lebih jauh), bukan untuk validasi
// transisi (yang sekarang bebas pilih, lihat buildTransitions).
export async function isDropdownValueAtLeast(
  grup: DropdownGroup,
  nilai: string,
  ambang: string
): Promise<boolean> {
  const options = await prisma.dropdownOption.findMany({ where: { grup }, orderBy: { urutan: "asc" } });
  const indexNilai = options.findIndex((o) => o.nilai === nilai);
  const indexAmbang = options.findIndex((o) => o.nilai === ambang);
  if (indexNilai === -1 || indexAmbang === -1) return false;
  return indexNilai >= indexAmbang;
}

// Daftar nilai (nilai saja) di grup yang urutannya >= ambang — dipakai untuk
// filter query Prisma (mis. daftar statusPpic mana saja yang dianggap "sudah
// Ready Kain ke atas" untuk query produk yang boleh dikerjakan Marketing).
export async function getDropdownValuesAtLeast(grup: DropdownGroup, ambang: string): Promise<string[]> {
  const options = await prisma.dropdownOption.findMany({ where: { grup }, orderBy: { urutan: "asc" } });
  const indexAmbang = options.findIndex((o) => o.nilai === ambang);
  if (indexAmbang === -1) return [];
  return options.slice(indexAmbang).map((o) => o.nilai);
}

// Sejak status/kategori bisa diedit admin, tidak ada lagi alur transisi baku
// per status — PIC divisi bebas pilih status aktif apa saja di grupnya
// selain status yang sedang berjalan. Dipakai sebagai prop `transitions`
// untuk StatusTransitionForm, yang cuma butuh key status saat ini terisi.
export function buildTransitions(
  options: { nilai: string }[],
  statusSekarang: string
): Record<string, string[]> {
  return {
    [statusSekarang]: options.filter((o) => o.nilai !== statusSekarang).map((o) => o.nilai),
  };
}
