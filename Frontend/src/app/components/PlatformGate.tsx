import { ArrowRight, BarChart3, CheckCircle2, Zap } from 'lucide-react';
import type { Platform } from '../types';

type PlatformGateProps = {
  onSelect: (platform: Platform) => void;
};

const platforms: Array<{
  name: Platform;
  description: string;
  points: string[];
}> = [
  {
    name: 'Clevertap',
    description: 'Clean campaign exports, detect channels, preview metrics, and build professional reports.',
    points: ['Email, Push, SMS, WhatsApp', 'Mixed campaign CSV support', 'CSV and Excel exports'],
  },
  {
    name: 'Moengage',
    description: 'Clean MoEngage exports, detect channels, preview metrics, and build professional reports.',
    points: ['Email, Push, SMS, WhatsApp, RCS', 'Mixed campaign CSV support', 'CSV and Excel exports'],
  },
];

export default function PlatformGate({ onSelect }: PlatformGateProps) {
  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#FF6B35] text-white shadow-lg">
              <BarChart3 className="size-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#111111]">Tribe.</div>
              <div className="mt-1 text-sm text-[#666666]">Reporting Agent</div>
            </div>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-8 lg:grid-cols-[0.85fr_1.15fr] lg:py-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-white/80 px-4 py-2 text-sm font-medium text-[#FF6B35] shadow-sm backdrop-blur-sm">
              <BarChart3 className="size-4" />
              Marketing report workspace
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-[#111111] sm:text-6xl">
                Select a platform to start reporting
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[#555555]">
                Choose the source first, then upload your CSV, clean channels, review data quality, and export the report.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {platforms.map((platform) => (
              <button
                type="button"
                key={platform.name}
                onClick={() => onSelect(platform.name)}
                className="group w-full rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/70 p-6 text-left shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FF6B35] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2 active:scale-95"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#FFE8D6] text-[#FF6B35]">
                          <Zap className="size-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#111111]">{platform.name}</h2>
                      </div>
                      <p className="mt-2 text-base font-medium leading-6 text-[#555555]">{platform.description}</p>
                    </div>
                    <div className="grid gap-3 pt-2 sm:grid-cols-3">
                      {platform.points.map((point) => (
                        <div key={point} className="flex items-start gap-2 text-sm text-[#555555]">
                          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#FF6B35]" />
                          <span className="font-medium">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#F4F5F6] text-[#111111] transition-all group-hover:bg-[#FF6B35] group-hover:text-white group-hover:shadow-lg">
                    <ArrowRight className="size-6" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
