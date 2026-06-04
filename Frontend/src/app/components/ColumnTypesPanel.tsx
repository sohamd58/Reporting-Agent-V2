import { ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';

type ColumnTypesPanelProps = {
  entries: Array<[string, string]>;
  isOpen: boolean;
  onToggle: () => void;
};

export default function ColumnTypesPanel({ entries, isOpen, onToggle }: ColumnTypesPanelProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/70 shadow-sm backdrop-blur-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-3 border-b border-[rgba(0,0,0,0.04)] px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[#111111]">Data Schema</h2>
          <p className="mt-1 text-sm text-[#666666]">Column types after data cleaning process</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#EFEFEF] px-4 text-sm font-medium text-[#111111] transition duration-200 hover:border-[#FF6B35] hover:text-[#FF6B35] hover:shadow-sm active:scale-95"
        >
          {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          <span className="hidden sm:inline">{isOpen ? 'Collapse' : 'Expand'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="p-4">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#F4F5F6] px-4 py-8 text-center text-sm font-medium text-[#666666]">
              <ClipboardList className="size-5 text-[#FF6B35]" />
              Clean data to inspect column types
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {entries.map(([column, type]) => (
                <div
                  key={column}
                  className="rounded-lg border border-[#FFB399] bg-[#FFF0E8] p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="truncate text-sm font-bold text-[#111111]" title={column}>
                    {column}
                  </div>
                  <div className="mt-3 inline-flex items-center rounded-full border border-[#FFB399] bg-white px-3 py-1 text-xs font-bold text-[#FF6B35]">
                    {type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
