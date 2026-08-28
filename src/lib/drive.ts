// Ekstrak file ID dari berbagai format URL share Google Drive, supaya bisa di-embed
// sebagai preview tanpa perlu Google Drive API / kredensial.
// Contoh yang didukung:
//   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
//   https://drive.google.com/open?id=FILE_ID
//   https://drive.google.com/uc?id=FILE_ID
export function extractDriveFileId(url: string): string | null {
  const patterns = [/\/file\/d\/([a-zA-Z0-9_-]{10,})/, /[?&]id=([a-zA-Z0-9_-]{10,})/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function drivePreviewUrl(fileId: string) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

// Thumbnail ringan (gambar biasa, bukan iframe) — cocok dipakai berulang di baris tabel.
export function driveThumbnailUrl(fileId: string, lebar = 100) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${lebar}`;
}
