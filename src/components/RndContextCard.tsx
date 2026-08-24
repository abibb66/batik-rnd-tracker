import { InfoCard } from "@/components/InfoCard";
import type { Produk } from "@/generated/prisma/client";

export function RndContextCard({
  produk,
  kategoriLabelMap,
}: {
  produk: Produk;
  kategoriLabelMap: Record<string, string>;
}) {
  return (
    <InfoCard
      items={[
        ["Kategori", produk.kategori ? kategoriLabelMap[produk.kategori] : "-"],
        ["Vendor", produk.vendor ?? "-"],
        ["Plan Launching", produk.planLaunching ? produk.planLaunching.toLocaleDateString("id-ID") : "-"],
        ["USP / Warna", produk.uspWarna ?? "-"],
      ]}
    />
  );
}
