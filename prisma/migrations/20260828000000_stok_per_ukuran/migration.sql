-- CreateTable
CREATE TABLE "stok_ukuran" (
    "id" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "ukuran" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL DEFAULT 0,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stok_ukuran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stok_ukuran_produkId_ukuran_key" ON "stok_ukuran"("produkId", "ukuran");

-- AddForeignKey
ALTER TABLE "stok_ukuran" ADD CONSTRAINT "stok_ukuran_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve existing single "stok" values as a legacy size row before dropping the column
INSERT INTO "stok_ukuran" ("id", "produkId", "ukuran", "jumlah", "urutan", "createdAt", "updatedAt")
SELECT 'legacy_' || "id", "id", 'Total (lama)', "stok", 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "produk"
WHERE "stok" IS NOT NULL;

-- AlterTable
ALTER TABLE "produk" DROP COLUMN "stok";
