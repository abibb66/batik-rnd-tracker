import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-sm flex-1 flex-col justify-center px-8 py-12">
      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="6" height="6" rx="1.2" />
          <rect x="11" y="3" width="6" height="6" rx="1.2" />
          <rect x="3" y="11" width="6" height="6" rx="1.2" />
          <rect x="11" y="11" width="6" height="6" rx="1.2" />
        </svg>
      </div>
      <h1 className="mt-4 text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Masuk</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Batik RnD Tracker — dashboard internal.</p>
      <div className="mt-6">
        <LoginForm next={next} />
      </div>
    </main>
  );
}
