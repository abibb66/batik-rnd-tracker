-- CreateEnum
CREATE TYPE "Divisi" AS ENUM ('RND', 'PPIC', 'WAREHOUSE', 'MARKETING', 'ADMIN', 'VISITOR');

-- CreateTable
CREATE TABLE "dropdown_option" (
    "id" TEXT NOT NULL,
    "grup" TEXT NOT NULL,
    "nilai" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dropdown_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "divisi" "Divisi" NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produk" (
    "id" TEXT NOT NULL,
    "kodeProduk" TEXT NOT NULL,
    "driveFolderLink" TEXT,
    "driveFolderId" TEXT,
    "kategori" TEXT,
    "vendor" TEXT,
    "uspWarna" TEXT,
    "tanggalMulai" TIMESTAMP(3),
    "planLaunching" TIMESTAMP(3),
    "desainLink" TEXT,
    "polaKemejaLink" TEXT,
    "statusRnd" TEXT NOT NULL DEFAULT 'ACC_DESAIN',
    "statusPpic" TEXT NOT NULL DEFAULT 'BELUM_MULAI',
    "tanggalMasukVendor" TIMESTAMP(3),
    "estimasiJadi" TIMESTAMP(3),
    "kendalaPpic" TEXT,
    "statusWarehouse" TEXT NOT NULL DEFAULT 'BELUM_MULAI',
    "sku" TEXT,
    "stok" INTEGER,
    "kendalaWarehouse" TEXT,
    "statusMarketing" TEXT NOT NULL DEFAULT 'BELUM_MULAI',
    "namaMotif" TEXT,
    "filosofiMotif" TEXT,
    "linkMarketplace" TEXT,
    "kendalaMarketing" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riwayat_status" (
    "id" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "divisi" "Divisi" NOT NULL,
    "statusDari" TEXT,
    "statusKe" TEXT NOT NULL,
    "diubahOlehId" TEXT,
    "catatan" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riwayat_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dropdown_option_grup_nilai_key" ON "dropdown_option"("grup", "nilai");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "produk_kodeProduk_key" ON "produk"("kodeProduk");

-- AddForeignKey
ALTER TABLE "riwayat_status" ADD CONSTRAINT "riwayat_status_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_status" ADD CONSTRAINT "riwayat_status_diubahOlehId_fkey" FOREIGN KEY ("diubahOlehId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
