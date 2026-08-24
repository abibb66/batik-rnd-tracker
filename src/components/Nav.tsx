import Link from "next/link";
import { getSession } from "@/lib/auth";
import { DIVISI_LABEL } from "@/lib/status";
import { LogoutButton } from "@/components/LogoutButton";

const links = [
  { href: "/", label: "Overview" },
  { href: "/rnd", label: "RnD" },
  { href: "/ppic", label: "PPIC" },
  { href: "/warehouse", label: "Warehouse" },
  { href: "/marketing", label: "Marketing" },
  { href: "/statistik", label: "Statistik" },
];

export async function Nav() {
  const session = await getSession();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-8 py-3.5">
        <div className="flex items-center gap-7">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="6" height="6" rx="1.2" />
                <rect x="11" y="3" width="6" height="6" rx="1.2" />
                <rect x="3" y="11" width="6" height="6" rx="1.2" />
                <rect x="11" y="11" width="6" height="6" rx="1.2" />
              </svg>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">Batik RnD Tracker</span>
          </div>
          {session && (
            <nav className="flex items-center gap-1 text-sm">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                >
                  {link.label}
                </Link>
              ))}
              {session.divisi === "ADMIN" && (
                <>
                  <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-800" />
                  <Link
                    href="/admin/opsi"
                    className="rounded-md px-3 py-2 font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                  >
                    Admin
                  </Link>
                  <Link
                    href="/admin/akun"
                    className="rounded-md px-3 py-2 font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                  >
                    Akun
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
        {session && (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                {session.nama.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{session.nama}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{DIVISI_LABEL[session.divisi]}</span>
              </div>
            </div>
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  );
}
