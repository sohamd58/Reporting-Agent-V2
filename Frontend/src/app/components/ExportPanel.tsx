import { BarChart3, Download, FileText, Zap } from 'lucide-react';

type ExportPanelProps = {
  selectedTemplate: string;
  onDownload: (format: 'csv' | 'xlsx') => void;
  canExport: boolean;
  isLoading: boolean;
  cleanedRowCount: number;
  selectedChannels: string[];
};

export default function ExportPanel({
  selectedTemplate,
  onDownload,
  canExport,
  isLoading,
  cleanedRowCount,
  selectedChannels,
}: ExportPanelProps) {
  const downloadDisabled = !canExport || isLoading;

  return (
    <section className="min-w-0 rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
      <div className="mb-6 space-y-2">
        <h2 className="text-lg font-bold text-[#111111]">Download Report</h2>
        <p className="text-sm text-[#666666]">
          Export the report-ready preview built in the Clean Data step.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#F7F8FA] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#111111]">
            <FileText className="size-4 text-[#FF6B35]" />
            {selectedTemplate || 'No template selected'}
          </div>
          <p className="mt-2 text-xs leading-5 text-[#666666]">
            Change the template in Clean Data, then run cleaning again to rebuild this export.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onDownload('csv')}
            disabled={downloadDisabled}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition-all duration-200 ${
              downloadDisabled
                ? 'cursor-not-allowed bg-[#EFEFEF] text-[#999999]'
                : 'bg-[#FF6B35] text-white hover:bg-[#FF8C00] hover:shadow-lg active:scale-95'
            }`}
          >
            <Download className="size-4" />
            {isLoading ? 'Downloading...' : 'CSV'}
          </button>
          <button
            type="button"
            onClick={() => onDownload('xlsx')}
            disabled={downloadDisabled}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition-all duration-200 ${
              downloadDisabled
                ? 'cursor-not-allowed border border-[rgba(0,0,0,0.08)] bg-[#EFEFEF] text-[#999999]'
                : 'border-2 border-[#FF6B35] bg-white text-[#FF6B35] hover:border-[#FF8C00] hover:shadow-sm active:scale-95'
            }`}
          >
            <Download className="size-4" />
            {isLoading ? 'Downloading...' : 'Excel'}
          </button>
        </div>
      </div>

      {cleanedRowCount > 0 ? (
        <div className="mt-4 rounded-lg border border-[#FFB399] bg-[#FFF0E8] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#FF6B35]">
            <Zap className="size-4" />
            {cleanedRowCount} cleaned rows ready
          </div>
          <div className="mt-2 text-xs text-[#FF6B35]">From channels: {selectedChannels.join(', ')}</div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#F4F5F6] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-[#666666]">
            <BarChart3 className="size-4 text-[#FF6B35]" />
            Clean selected channels before exporting
          </div>
        </div>
      )}
    </section>
  );
}
