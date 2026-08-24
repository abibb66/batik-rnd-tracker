import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Divisi } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// Password dev bersama untuk semua akun seed — GANTI di production.
const SEED_PASSWORD = "password123";

// Nilai awal dropdown (Kategori & Status per divisi), sekarang bisa diedit
// lewat /admin/opsi. Daftar ini cuma seed pertama kali — perubahan berikutnya
// dilakukan lewat halaman admin, bukan di sini.
const DROPDOWN_OPTIONS: { grup: string; nilai: string; label: string; urutan: number }[] = [
  { grup: "KATEGORI", nilai: "EXCLUSIVE", label: "Exclusive", urutan: 0 },
  { grup: "KATEGORI", nilai: "SIGNATURE", label: "Signature", urutan: 1 },
  { grup: "KATEGORI", nilai: "WOMEN", label: "Women", urutan: 2 },

  { grup: "STATUS_RND", nilai: "ACC_DESAIN", label: "ACC Desain", urutan: 0 },
  { grup: "STATUS_RND", nilai: "PROSES_STRIKE_OFF", label: "Proses Strike Off", urutan: 1 },
  { grup: "STATUS_RND", nilai: "REVISI_STRIKE_OFF", label: "Revisi Strike Off", urutan: 2 },
  { grup: "STATUS_RND", nilai: "ACC_STRIKE_OFF", label: "ACC Strike Off", urutan: 3 },
  { grup: "STATUS_RND", nilai: "PO_KAIN", label: "PO Kain", urutan: 4 },
  { grup: "STATUS_RND", nilai: "REJECTED", label: "Rejected", urutan: 5 },

  { grup: "STATUS_PPIC", nilai: "BELUM_MULAI", label: "Belum Mulai", urutan: 0 },
  { grup: "STATUS_PPIC", nilai: "POLA_KEMEJA", label: "Pola Kemeja", urutan: 1 },
  { grup: "STATUS_PPIC", nilai: "READY_KAIN", label: "Ready Kain", urutan: 2 },
  { grup: "STATUS_PPIC", nilai: "SAMPLING_KEMEJA", label: "Sampling Kemeja", urutan: 3 },
  { grup: "STATUS_PPIC", nilai: "READY_STOK", label: "Ready Stok", urutan: 4 },

  { grup: "STATUS_WAREHOUSE", nilai: "BELUM_MULAI", label: "Belum Mulai", urutan: 0 },
  { grup: "STATUS_WAREHOUSE", nilai: "INPUT_SKU", label: "Input SKU", urutan: 1 },
  { grup: "STATUS_WAREHOUSE", nilai: "PENCATATAN_STOK", label: "Pencatatan Stok", urutan: 2 },
  { grup: "STATUS_WAREHOUSE", nilai: "READY_TO_LAUNCH", label: "Ready to Launch", urutan: 3 },

  { grup: "STATUS_MARKETING", nilai: "BELUM_MULAI", label: "Belum Mulai", urutan: 0 },
  { grup: "STATUS_MARKETING", nilai: "PRODUKSI_KONTEN", label: "Produksi Konten", urutan: 1 },
  { grup: "STATUS_MARKETING", nilai: "UPLOAD_MARKETPLACE", label: "Upload Marketplace", urutan: 2 },
  { grup: "STATUS_MARKETING", nilai: "LAUNCH", label: "Launch", urutan: 3 },
];

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  await Promise.all(
    DROPDOWN_OPTIONS.map((o) =>
      prisma.dropdownOption.upsert({
        where: { grup_nilai: { grup: o.grup, nilai: o.nilai } },
        update: { label: o.label, urutan: o.urutan },
        create: o,
      })
    )
  );

  const users = await Promise.all(
    [
      { nama: "Admin", email: "admin@batik.local", divisi: Divisi.ADMIN },
      { nama: "RnD - Rina", email: "rnd@batik.local", divisi: Divisi.RND },
      { nama: "PPIC - Budi", email: "ppic@batik.local", divisi: Divisi.PPIC },
      { nama: "Warehouse - Sari", email: "warehouse@batik.local", divisi: Divisi.WAREHOUSE },
      { nama: "Marketing - Dedi", email: "marketing@batik.local", divisi: Divisi.MARKETING },
    ].map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: { passwordHash },
        create: { ...u, passwordHash },
      })
    )
  );

  const produk = await prisma.produk.upsert({
    where: { kodeProduk: "BTK-0001" },
    update: {},
    create: {
      kodeProduk: "BTK-0001",
      kategori: "EXCLUSIVE",
      vendor: "Trading 1500",
      uspWarna: "Motif parang biru indigo",
      tanggalMulai: new Date(),
      planLaunching: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      statusRnd: "ACC_DESAIN",
    },
  });

  const riwayatAda = await prisma.riwayatStatus.findFirst({ where: { produkId: produk.id } });
  if (!riwayatAda) {
    await prisma.riwayatStatus.create({
      data: {
        produkId: produk.id,
        divisi: Divisi.RND,
        statusDari: null,
        statusKe: "ACC_DESAIN",
        diubahOlehId: users[1].id,
        catatan: "Desain awal disetujui, mulai tracking di dashboard.",
      },
    });
  }

  console.log("Seed selesai:", { users: users.length, produk: produk.kodeProduk, password: SEED_PASSWORD });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
