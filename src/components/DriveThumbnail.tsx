import { extractDriveFileId, driveThumbnailUrl } from "@/lib/drive";

const SIZE_CLASS = {
  sm: "w-32 aspect-[3/5]",
  lg: "w-44 aspect-[3/5]",
};

export function DriveThumbnail({
  url,
  alt,
  size = "sm",
}: {
  url: string | null;
  alt: string;
  size?: "sm" | "lg";
}) {
  const fileId = url ? extractDriveFileId(url) : null;
  const dimensionClass = SIZE_CLASS[size];

  if (!fileId) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-[9px] text-zinc-400 dark:border-zinc-700 ${dimensionClass}`}
      >
        —
      </div>
    );
  }

  return (
    <a href={url ?? undefined} target="_blank" rel="noopener noreferrer" className="block shrink-0" title="Buka file di Drive">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={driveThumbnailUrl(fileId, size === "lg" ? 400 : 280)}
        alt={alt}
        className={`rounded-lg border border-zinc-200 object-cover transition-opacity hover:opacity-80 dark:border-zinc-800 ${dimensionClass}`}
      />
    </a>
  );
}
