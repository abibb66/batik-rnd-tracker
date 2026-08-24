-- CreateTable
CREATE TABLE "dropdown_option" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grup" TEXT NOT NULL,
    "nilai" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "dropdown_option_grup_nilai_key" ON "dropdown_option"("grup", "nilai");
