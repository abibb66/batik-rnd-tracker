-- CreateTable
CREATE TABLE "vendor" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "leadTimeHari" INTEGER NOT NULL DEFAULT 14,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_nama_key" ON "vendor"("nama");
