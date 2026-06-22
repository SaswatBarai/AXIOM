interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
}

export function StatCard({ label, value, sublabel }: StatCardProps) {
  return (
    <div className="border border-zinc-800/60 bg-zinc-900/20 p-5 rounded-2xl">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-3xl font-extrabold text-white mt-2">{value}</div>
      {sublabel && (
        <div className="text-xs text-zinc-500 mt-1">{sublabel}</div>
      )}
    </div>
  );
}
