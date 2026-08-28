-- AlterTable
ALTER TABLE "produk" ADD COLUMN     "estimasiStrikeOffJadi" TIMESTAMP(3),
ADD COLUMN     "strikeOffDicetak" BOOLEAN NOT NULL DEFAULT false;
