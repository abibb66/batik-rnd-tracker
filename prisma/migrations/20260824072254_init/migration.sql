-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "divisi" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "produk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kodeProduk" TEXT NOT NULL,
    "driveFolderLink" TEXT,
    "driveFolderId" TEXT,
    "kategori" TEXT,
    "vendor" TEXT,
    "uspWarna" TEXT,
    "tanggalMulai" DATETIME,
    "planLaunching" DATETIME,
    "polaKemejaLink" TEXT,
    "statusRnd" TEXT NOT NULL DEFAULT 'ACC_DESAIN',
    "statusPpic" TEXT NOT NULL DEFAULT 'BELUM_MULAI',
    "tanggalMasukVendor" DATETIME,
    "estimasiJadi" DATETIME,
    "kendalaPpic" TEXT,
    "statusWarehouse" TEXT NOT NULL DEFAULT 'BELUM_MULAI',
    "sku" TEXT,
    "kendalaWarehouse" TEXT,
    "statusMarketing" TEXT NOT NULL DEFAULT 'BELUM_MULAI',
    "namaMotif" TEXT,
    "filosofiMotif" TEXT,
    "kendalaMarketing" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "riwayat_status" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produkId" TEXT NOT NULL,
    "divisi" TEXT NOT NULL,
    "statusDari" TEXT,
    "statusKe" TEXT NOT NULL,
    "diubahOlehId" TEXT,
    "catatan" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "riwayat_status_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "produk" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "riwayat_status_diubahOlehId_fkey" FOREIGN KEY ("diubahOlehId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "produk_kodeProduk_key" ON "produk"("kodeProduk");
