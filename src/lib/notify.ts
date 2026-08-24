import { prisma } from "@/lib/prisma";
import { Divisi } from "@/generated/prisma/client";

type NotificationPayload = {
  to: string[];
  subject: string;
  body: string;
};

/**
 * Notifikasi lintas divisi disengaja hanya dicatat ke server log, bukan email —
 * tim memutuskan tidak perlu integrasi provider email untuk tool internal ini.
 * PIC divisi terkait tetap bisa lihat produk barunya lewat dashboard masing-masing.
 */
async function logNotification(payload: NotificationPayload) {
  if (payload.to.length === 0) return;
  console.log("[notify]", { to: payload.to, subject: payload.subject, body: payload.body });
}

async function emailsForDivisi(...divisi: Divisi[]) {
  const users = await prisma.user.findMany({
    where: { divisi: { in: divisi } },
    select: { email: true },
  });
  return users.map((u) => u.email);
}

export async function notifyPoKain(produk: { kodeProduk: string }) {
  const to = await emailsForDivisi(Divisi.PPIC, Divisi.WAREHOUSE);
  await logNotification({
    to,
    subject: `[Batik Tracker] ${produk.kodeProduk} — PO Kain, PPIC & Warehouse bisa mulai`,
    body: `Produk ${produk.kodeProduk} sudah mencapai status PO Kain di RnD. PPIC dan Warehouse bisa mulai proses masing-masing secara paralel.`,
  });
}

export async function notifyReadyKain(produk: { kodeProduk: string }) {
  const to = await emailsForDivisi(Divisi.MARKETING);
  await logNotification({
    to,
    subject: `[Batik Tracker] ${produk.kodeProduk} — Ready Kain, Marketing bisa mulai isi data`,
    body: `PPIC produk ${produk.kodeProduk} sudah Ready Kain. Marketing bisa mulai isi nama motif, filosofi motif, dan link marketplace, sambil menunggu Warehouse menyelesaikan SKU & stok.`,
  });
}

export async function notifyReadyToLaunch(produk: { kodeProduk: string; sku: string | null }) {
  const to = await emailsForDivisi(Divisi.MARKETING);
  await logNotification({
    to,
    subject: `[Batik Tracker] ${produk.kodeProduk} — Ready to Launch, Marketing bisa mulai`,
    body: `Warehouse produk ${produk.kodeProduk} sudah Ready to Launch (SKU: ${produk.sku ?? "-"}). Marketing bisa mulai proses konten & upload marketplace.`,
  });
}

// Konfirmasi ke seluruh tim begitu produk resmi Launch (nice-to-have di brief).
export async function notifyLaunch(produk: { kodeProduk: string; namaMotif: string | null }) {
  const to = await emailsForDivisi(Divisi.RND, Divisi.PPIC, Divisi.WAREHOUSE, Divisi.MARKETING, Divisi.ADMIN);
  await logNotification({
    to,
    subject: `[Batik Tracker] ${produk.kodeProduk} — Launch!`,
    body: `Produk ${produk.kodeProduk}${produk.namaMotif ? ` (${produk.namaMotif})` : ""} resmi Launch di marketplace.`,
  });
}
