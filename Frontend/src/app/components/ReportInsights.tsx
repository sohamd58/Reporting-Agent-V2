import { Sparkles } from 'lucide-react';
import insightsPlaceholder from '../assets/report-insights-placeholder.svg';

export default function ReportInsights() {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/70 shadow-sm backdrop-blur-sm">
      <div className="border-b border-[rgba(0,0,0,0.04)] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#FFE8D6] text-[#FF6B35]">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#111111]">Report Insights</h2>
            <p className="mt-1 text-sm text-[#666666]">Automated observations for cleaned reports</p>
          </div>
        </div>
      </div>

      <div className="relative h-32 overflow-hidden sm:h-36">
        <img
          src={insightsPlaceholder}
          alt=""
          className="h-full w-full object-cover opacity-35 grayscale"
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-white/45">
          <div className="rounded-full border border-[#FFB399] bg-white/85 px-5 py-2 text-sm font-bold uppercase tracking-widest text-[#FF6B35] shadow-sm">
            coming soon
          </div>
        </div>
      </div>
    </section>
  );
}
