import { CheckCircle2, Circle, UploadCloud, Zap } from 'lucide-react';
import TemplateSelector from './TemplateSelector';

type ChannelSelectorProps = {
  channels: string[];
  selectedChannels: string[];
  templates: string[];
  selectedTemplate: string;
  isTemplateOpen: boolean;
  onToggle: (channel: string) => void;
  onToggleTemplateOpen: () => void;
  onSelectTemplate: (template: string) => void;
  onClean: () => void;
  disabled: boolean;
};

export default function ChannelSelector({
  channels,
  selectedChannels,
  templates,
  selectedTemplate,
  isTemplateOpen,
  onToggle,
  onToggleTemplateOpen,
  onSelectTemplate,
  onClean,
  disabled,
}: ChannelSelectorProps) {
  const cannotClean = disabled || selectedChannels.length === 0 || !selectedTemplate;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F7F8FA] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#FF6B35]">Channels to Clean</h3>
            <p className="mt-1 text-sm leading-6 text-[#666666]">
              Only channels supported by the cleaner are shown here.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#666666]">
            {selectedChannels.length}/{channels.length}
          </span>
        </div>

        {channels.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-[#D9D9D9] bg-white p-4 text-sm font-medium text-[#666666]">
            <UploadCloud className="size-5 shrink-0 text-[#FF6B35]" />
            Upload a CSV file to detect cleanable channels.
          </div>
        ) : (
          <div className="grid gap-2 xl:grid-cols-2">
            {channels.map((channel) => {
              const selected = selectedChannels.includes(channel);
              return (
                <button
                  type="button"
                  key={channel}
                  onClick={() => onToggle(channel)}
                  className={`flex min-h-14 w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
                    selected
                      ? 'border-[#FF6B35] bg-[#FFF0E8] text-[#111111] shadow-sm'
                      : 'border-[rgba(0,0,0,0.08)] bg-white text-[#111111] hover:border-[#FFB399]'
                  }`}
                >
                  {selected ? (
                    <CheckCircle2 className="size-5 shrink-0 text-[#FF6B35]" />
                  ) : (
                    <Circle className="size-5 shrink-0 text-[#999999]" />
                  )}
                  <span className="min-w-0 flex-1 break-words text-sm font-semibold leading-5">
                    {channel}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F7F8FA] p-4">
        <div className="mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#FF6B35]">Columns to Export</h3>
          <p className="mt-1 text-sm leading-6 text-[#666666]">
            Choose the template before cleaning so the preview uses the same export columns.
          </p>
        </div>
        <TemplateSelector
          templates={templates}
          selectedTemplate={selectedTemplate}
          isOpen={isTemplateOpen}
          onToggleOpen={onToggleTemplateOpen}
          onSelect={onSelectTemplate}
        />
      </div>

      <button
        type="button"
        onClick={onClean}
        disabled={cannotClean}
        className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition-all duration-200 ${
          cannotClean
            ? 'cursor-not-allowed bg-[#EFEFEF] text-[#999999]'
            : 'bg-[#FF6B35] text-white hover:bg-[#FF8C00] hover:shadow-lg active:scale-95'
        }`}
      >
        <Zap className="size-4" />
        Clean Rows and Build Preview
      </button>

      {selectedChannels.length > 0 && (
        <div className="rounded-lg border border-[#FFB399] bg-[#FFF0E8] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#FF6B35]">
            <CheckCircle2 className="size-4 shrink-0" />
            {selectedChannels.length} selected for cleaning
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedChannels.map((channel) => (
              <span
                key={channel}
                className="inline-flex items-center rounded-full bg-[#FFE8D6] px-3 py-1 text-xs font-semibold text-[#FF6B35]"
              >
                {channel}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
