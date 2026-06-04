import { useState } from 'react';
import {
  Bot,
  Building2,
  ChevronDown,
  Database,
  FileSpreadsheet,
  LayoutDashboard,
  Menu,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import type { Platform } from '../types';

type DashboardShellProps = {
  platform: Platform;
  onChangePlatform: () => void;
  onOpenTemplateDesigner: () => void;
  children: React.ReactNode;
};

const agents = [
  { id: 'clevertap', label: 'CleverTap Agent', icon: UploadCloud },
  { id: 'moengage', label: 'MoEngage Agent', icon: Database },
  { id: 'templates', label: 'Template Designer', icon: Building2 },
  { id: 'analytics', label: 'Analytics', icon: FileSpreadsheet },
];

const workflowSteps = [
  { label: 'Upload', icon: UploadCloud },
  { label: 'Channels', icon: Database },
  { label: 'Preview', icon: FileSpreadsheet },
  { label: 'Export', icon: Building2 },
];

export default function DashboardShell({
  platform,
  onChangePlatform,
  onOpenTemplateDesigner,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);

  return (
    <div className="h-dvh w-full overflow-hidden bg-[#F7F8FA]">
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-[18rem] max-w-[calc(100vw-2rem)] border-r border-[rgba(0,0,0,0.08)] bg-white
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-[rgba(0,0,0,0.08)] px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6B35] text-sm font-bold text-white">
                RB
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-[#111111]">Report Builder</div>
                <div className="truncate text-xs text-[#666666]">CSV reporting engine</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex size-9 items-center justify-center rounded-lg text-[#666666] transition hover:bg-[#F4F5F6] hover:text-[#111111] lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[rgba(0,0,0,0.04)] p-4">
              <button
                type="button"
                onClick={() => setAgentDropdownOpen(!agentDropdownOpen)}
                className="flex w-full items-center justify-between rounded-lg p-3 text-sm font-semibold text-[#111111] transition hover:bg-[#F4F5F6]"
              >
                <span className="inline-flex items-center gap-2">
                  <Bot className="size-4 text-[#FF6B35]" />
                  Agents
                </span>
                <ChevronDown className={`size-4 transition-transform ${agentDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {agentDropdownOpen && (
                <div className="mt-2 space-y-1">
                  {agents.map((agent) => (
                    <button
                      type="button"
                      key={agent.id}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#666666] transition hover:bg-[#FFF0E8] hover:text-[#FF6B35]"
                    >
                      <agent.icon className="size-4" />
                      {agent.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-b border-[rgba(0,0,0,0.04)] p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#FF6B35]">
                Active Platform
              </div>
              <div className="truncate text-lg font-bold text-[#111111]">{platform}</div>
              <p className="mt-1 text-xs text-[#666666]">CSV reporting engine</p>
            </div>

            <div className="p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#FF6B35]">
                Workflow Steps
              </div>
              <div className="space-y-1">
                {workflowSteps.map((step, index) => (
                  <div
                    key={step.label}
                    className="flex items-center gap-3 rounded-lg p-2 text-sm font-medium text-[#111111] transition hover:bg-[#F4F5F6]"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FF6B35] text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <step.icon className="size-4 shrink-0 text-[#666666]" />
                    <span className="truncate">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-[rgba(0,0,0,0.04)] p-4">
            <button
              type="button"
              onClick={onChangePlatform}
              className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] px-4 py-2.5 text-center text-sm font-semibold text-[#111111] transition hover:border-[#FF6B35] hover:bg-[#FFF0E8] hover:text-[#FF6B35]"
            >
              Change Platform
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-dvh w-full min-w-0 flex-col overflow-hidden lg:pl-[18rem]">
        <header className="z-30 h-20 shrink-0 border-b border-[rgba(0,0,0,0.08)] bg-white shadow-sm">
          <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[rgba(0,0,0,0.08)] text-[#111111] transition hover:bg-[#F4F5F6] lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="size-5" />
              </button>

              <div className="min-w-0">
                <h1 className="flex min-w-0 items-center gap-2 text-xl font-bold text-[#111111] sm:text-2xl">
                  <LayoutDashboard className="hidden size-5 shrink-0 text-[#FF6B35] sm:block" />
                  <span className="truncate">Report Builder</span>
                  <Sparkles className="size-5 shrink-0 text-[#FF6B35]" />
                </h1>
                <p className="mt-1 truncate text-xs text-[#666666] sm:text-sm">
                  {platform} / CSV Processing
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenTemplateDesigner}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#FF8C00] hover:shadow-lg active:scale-95 sm:px-4"
            >
              <Building2 className="size-4" />
              <span className="hidden sm:inline">Templates</span>
            </button>
          </div>
        </header>

        <main className="min-h-0 w-full flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1760px] px-4 py-6 sm:px-6 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
