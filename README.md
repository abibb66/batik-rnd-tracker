# Batik RnD Tracker

Dashboard internal untuk men-track produk batik melintasi 4 divisi:
**RnD → PPIC & Warehouse (paralel) → Marketing**.

Stack: Next.js (App Router) + Prisma + SQLite + Tailwind CSS.

## Status pengembangan

- [x] Fase 1 — Setup project Next.js + Prisma, schema database (`Produk`, `RiwayatStatus`, `User`)
- [x] Fase 2 — Modul RnD (CRUD, state machine status). **Keputusan final**: tidak integrasi
      Google Drive API — link Drive ditempel manual, lalu di-preview langsung (embed) di
      dashboard. Lihat bagian **Preview file Google Drive** di bawah.
- [x] Fase 3 — Modul PPIC & Warehouse (paralel). **Keputusan final**: tidak ada integrasi
      email — notifikasi PO Kain & Ready to Launch cukup lewat log server
      ([`src/lib/notify.ts`](src/lib/notify.ts)); PIC tetap lihat produk barunya lewat
      dashboard masing-masing begitu login.
- [x] Fase 4 — Modul Marketing. Notifikasi Launch (nice-to-have di brief) juga cuma log
      server, sama seperti Fase 3.
- [x] Fase 5 — Dashboard overview lintas divisi (homepage `/`)
- [x] Fase 6 (auth) — Autentikasi & role per divisi selesai. Sisa: migrasi ke PostgreSQL +
      deploy ke Vercel, ditunda sampai ada connection string Postgres siap pakai (lihat
      bagian **Deploy** di bawah).

## Menjalankan project

```bash
npm install
cp .env.example .env   # lalu isi AUTH_SECRET (lihat komentar di file)
npm run db:seed        # isi data contoh + 5 akun login (lihat bagian Login)
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — akan redirect ke halaman login.

## Login

Autentikasi custom (bukan NextAuth): email+password, hash dengan `bcryptjs`, sesi disimpan
sebagai JWT (`jose`) di cookie httpOnly. Lihat [`src/lib/auth.ts`](src/lib/auth.ts) dan
[`src/proxy.ts`](src/proxy.ts) (semua route butuh login kecuali `/login`).

Akun dari `npm run db:seed` (password sama untuk semua, **ganti sebelum production**):

| Email | Divisi | Password |
|---|---|---|
| admin@batik.local | Admin (akses semua) | `password123` |
| rnd@batik.local | RnD | `password123` |
| ppic@batik.local | PPIC | `password123` |
| warehouse@batik.local | Warehouse | `password123` |
| marketing@batik.local | Marketing | `password123` |

**Role per divisi**: siapa pun yang login bisa melihat semua halaman (termasuk dashboard
overview), tapi form ubah status / edit detail di suatu divisi hanya aktif untuk user divisi
itu atau Admin — divisi lain melihat versi read-only dengan catatan "Hanya PIC X atau Admin
yang bisa mengubah data ini." Pengecekan ini dilakukan di server action (`canManage()` di
`src/lib/auth.ts`), bukan cuma disembunyikan di UI. Field "diubah oleh" di riwayat status kini
otomatis dari user yang login, tidak lagi dropdown manual.

## Preview file Google Drive

Tidak pakai Google Drive API. RnD tempel link share Google Drive biasa di field **Link Desain**
/ **Link Pola Kemeja**, lalu dashboard (RnD, PPIC, Warehouse, Marketing) menampilkan preview-nya
langsung lewat `<iframe>` embed Drive — lihat [`src/lib/drive.ts`](src/lib/drive.ts) (ekstrak
file ID dari URL) dan [`src/components/DriveFilePreview.tsx`](src/components/DriveFilePreview.tsx).

Syarat supaya preview muncul: file di Drive harus di-share sebagai **"Anyone with the link"**.
Kalau link bukan format Drive yang dikenali (atau file tidak public), otomatis fallback jadi
tombol "Buka link" biasa — tidak error.

## Deploy

Hosting: **Vercel**, database: **Neon Postgres** (sudah dimigrasikan, live). Repo:
[github.com/abibb66/batik-rnd-tracker](https://github.com/abibb66/batik-rnd-tracker).

Env var yang harus di-set di Vercel project settings:
- `DATABASE_URL` — connection string Neon yang **pooled** (host berakhiran `-pooler`), dipakai
  runtime aplikasi lewat `@prisma/adapter-pg` di [`src/lib/prisma.ts`](src/lib/prisma.ts).
- `AUTH_SECRET` — secret produksi terpisah dari dev (generate lewat
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).

`postinstall` script (`prisma generate`) otomatis jalan tiap `npm install` di build Vercel —
tanpa ini build gagal karena `src/generated/prisma` sengaja tidak di-commit (lihat `.gitignore`).

Migrasi skema ke database baru dijalankan manual dari lokal (bukan bagian dari build Vercel):

```bash
npx prisma migrate deploy   # pakai DATABASE_URL_UNPOOLED di .env (koneksi langsung, bukan pooler)
npm run db:seed
```

## Database

- Provider: **PostgreSQL** (Neon). Dua connection string dipakai untuk peran berbeda:
  - `DATABASE_URL` — pooled (lewat PgBouncer, host `...-pooler...`), dipakai aplikasi saat runtime.
  - `DATABASE_URL_UNPOOLED` — koneksi langsung, dipakai CLI Prisma (`migrate`/`studio`) supaya
    aman untuk DDL & advisory lock (lihat [`prisma.config.ts`](prisma.config.ts)).
- Schema: [`prisma/schema.prisma`](prisma/schema.prisma).
- Prisma Client di-generate ke `src/generated/prisma` (jangan di-edit manual, jangan di-commit).
- Prisma 7 memerlukan driver adapter untuk runtime aplikasi — lihat [`src/lib/prisma.ts`](src/lib/prisma.ts) (`@prisma/adapter-pg`).
- Riwayat migrasi SQLite (sebelum pindah ke Postgres) sengaja direset — migrasi lama dialek
  SQLite tidak kompatibel dengan Postgres, jadi `prisma/migrations/` dimulai ulang dari `init`.

Perintah umum:

```bash
npx prisma migrate dev --name <nama_migrasi>   # buat & terapkan migrasi baru (lokal, dev)
npx prisma studio                              # GUI untuk lihat/edit data
npm run db:seed                                # jalankan prisma/seed.ts
```

## Model data

- **Produk** — satu baris per produk, menyimpan field dari semua divisi (RnD, PPIC,
  Warehouse, Marketing) plus status per divisi (`statusRnd`, `statusPpic`,
  `statusWarehouse`, `statusMarketing`). PPIC & Warehouse berjalan independen begitu
  `statusRnd` mencapai `PO_KAIN`; Marketing baru mulai (`BELUM_MULAI` → jalan) setelah
  Warehouse mencapai `READY_TO_LAUNCH`.
- **RiwayatStatus** — log setiap perubahan status per divisi, termasuk siapa yang
  mengubah dan catatan bebas (kendala).
- **User** — akun per divisi (`RND` / `PPIC` / `WAREHOUSE` / `MARKETING` / `ADMIN`),
  email dipakai juga untuk notifikasi.
