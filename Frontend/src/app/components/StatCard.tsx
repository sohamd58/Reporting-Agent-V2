import type { ReactNode } from 'react';

type StatCardProps = {
  label: string;
  value: ReactNode;
  detail?: string;
};

export default function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="min-w-0 rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/70 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="text-xs font-bold uppercase tracking-widest text-[#FF6B35] mb-3">{label}</div>
      <div className="break-words text-3xl font-bold text-[#111111]">{value}</div>
      {detail && <div className="mt-2 truncate text-sm font-medium text-[#666666]">{detail}</div>}
    </div>
  );
}
