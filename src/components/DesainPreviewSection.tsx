import { DriveFilePreview } from "@/components/DriveFilePreview";

export function DesainPreviewSection({
  desainLink,
  polaKemejaLink,
}: {
  desainLink: string | null;
  polaKemejaLink: string | null;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Preview File
      </h2>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
        File di Google Drive harus di-share sebagai &quot;Anyone with the link&quot; supaya preview-nya muncul.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DriveFilePreview url={desainLink} label="Desain" />
        <DriveFilePreview url={polaKemejaLink} label="Pola Kemeja" />
      </div>
    </section>
  );
}
