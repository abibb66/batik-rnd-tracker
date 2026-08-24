export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Belum ada data.</p>;
  }

  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-32 shrink-0 truncate text-xs text-zinc-600 dark:text-zinc-400" title={d.label}>
            {d.label}
          </div>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
              style={{ width: `${Math.max(4, (d.value / max) * 100)}%` }}
            />
          </div>
          <div className="w-6 shrink-0 text-right text-xs font-medium text-zinc-900 dark:text-zinc-50">
            {d.value}
          </div>
        </div>
      ))}
    </div>
  );
}
