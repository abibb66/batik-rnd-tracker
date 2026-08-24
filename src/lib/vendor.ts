// Daftar awal vendor, disimpan sebagai String bebas di Produk.vendor (bisa
// ditambah tanpa migrasi). Terpisah dari status.ts karena file ini aman
// diimpor komponen client (status.ts sekarang query DB, server-only).
export const VENDOR_LIST = [
  "Trading 1500",
  "Trading DigiPrint",
  "Harjono 1.5",
  "Harjono 115",
  "Bima Kunting",
  "Mbak Dwi",
  "Mas Della",
  "Rudy",
] as const;
