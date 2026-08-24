export function InfoCard({ items }: { items: [string, string][] }) {
  return (
    <div className="card grid grid-cols-2 gap-4 p-4 text-sm sm:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label}>
          <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-600">{label}</div>
          <div className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-50">{value}</div>
        </div>
      ))}
    </div>
  );
}
