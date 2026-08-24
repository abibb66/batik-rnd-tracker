import { extractDriveFileId, drivePreviewUrl } from "@/lib/drive";

export function DriveFilePreview({ url, label }: { url: string | null; label: string }) {
  if (!url) {
    return (
      <div>
        <div className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
        <div className="flex aspect-[3/5] items-center justify-center rounded-xl border border-dashed border-zinc-300 text-xs text-zinc-400 dark:border-zinc-700">
          Belum ada link
        </div>
      </div>
    );
  }

  const fileId = extractDriveFileId(url);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>{label}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
          Buka di Drive ↗
        </a>
      </div>
      {fileId ? (
        <iframe
          src={drivePreviewUrl(fileId)}
          className="aspect-[3/5] w-full rounded-xl border border-zinc-200 dark:border-zinc-800"
          allow="autoplay"
          title={label}
        />
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex aspect-[3/5] items-center justify-center rounded-xl border border-zinc-200 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:border-zinc-800 dark:text-indigo-400"
        >
          Buka link
        </a>
      )}
    </div>
  );
}
