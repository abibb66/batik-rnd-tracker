const KATEGORI_TINTS: Record<string, string> = {
  EXCLUSIVE: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  SIGNATURE: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  WOMEN: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
};

export function kategoriTint(k: string) {
  return KATEGORI_TINTS[k] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
}
