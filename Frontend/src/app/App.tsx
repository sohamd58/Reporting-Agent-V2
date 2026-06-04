import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, Circle, ClipboardList, LoaderCircle } from 'lucide-react';
import {
  cleanData,
  detectChannels,
  downloadReport,
  listTemplates,
  uploadFile,
} from './api';
import ChannelSelector from './components/ChannelSelector';
import ColumnTypesPanel from './components/ColumnTypesPanel';
import ConfirmDialog from './components/ConfirmDialog';
import DashboardShell from './components/DashboardShell';
import DataTable from './components/DataTable';
import ExportPanel from './components/ExportPanel';
import PlatformGate from './components/PlatformGate';
import StatCard from './components/StatCard';
import TemplateDesigner from './components/TemplateDesigner';
import UploadDropzone from './components/UploadDropzone';
import type { Platform, PreviewState, SortConfig } from './types';

const DEFAULT_REPORT_TEMPLATE = 'CleverTap Reporting Agent - Default';

type PreviewPayload = {
  columns: string[];
  rows: Record<string, unknown>[];
  row_count: number;
  column_count: number;
};

function buildPreview(type: PreviewState['type'], payload: PreviewPayload): PreviewState {
  return {
    type,
    columns: payload.columns,
    rows: payload.rows,
    rowCount: payload.row_count,
    columnCount: payload.column_count,
  };
}

function sortRows(rows: Record<string, unknown>[], config: SortConfig) {
  if (!config) return rows;

  return [...rows].sort((a, b) => {
    const aValue = a[config.key];
    const bValue = b[config.key];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const aString = String(aValue ?? '').toLowerCase();
    const bString = String(bValue ?? '').toLowerCase();

    if (aString === bString) return 0;
    if (config.direction === 'asc') return aString < bString ? -1 : 1;
    return aString > bString ? -1 : 1;
  });
}

function nextSortConfig(current: SortConfig, key: string): SortConfig {
  if (current?.key === key && current.direction === 'asc') {
    return { key, direction: 'desc' };
  }
  return { key, direction: 'asc' };
}

export default function App() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'template'>('dashboard');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [previewSortConfig, setPreviewSortConfig] = useState<SortConfig>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [showColumnTypes, setShowColumnTypes] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [hasCleanedData, setHasCleanedData] = useState(false);
  const [cleanedTemplate, setCleanedTemplate] = useState('');
  const [cleanedSelectionKey, setCleanedSelectionKey] = useState('');
  const [fileId, setFileId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);
  const [columnTypes, setColumnTypes] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [showPlatformConfirm, setShowPlatformConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sortedPreviewRows = useMemo(
    () => sortRows(preview?.rows ?? [], previewSortConfig).slice(0, 10),
    [preview?.rows, previewSortConfig],
  );
  const columnTypesEntries = useMemo(() => Object.entries(columnTypes), [columnTypes]);
  const selectedChannelsKey = useMemo(
    () => [...selectedChannels].sort().join('|'),
    [selectedChannels],
  );
  const canExportReport =
    hasCleanedData &&
    Boolean(selectedTemplate) &&
    cleanedTemplate === selectedTemplate &&
    cleanedSelectionKey === selectedChannelsKey;
  const previewTitle =
    preview?.type === 'cleaned' ? 'Cleaned Data Preview' : 'Raw Data Preview';
  const previewSubtitle =
    preview?.type === 'cleaned'
      ? `${preview.rowCount} report-ready rows from selected channels`
      : preview
        ? 'First 10 rows from your upload'
        : 'Upload a CSV file to preview data';
  const previewBadge = preview?.type === 'cleaned' ? 'Cleaned' : 'Raw';
  const previewBadgeClass =
    preview?.type === 'cleaned'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-[#F4F5F6] text-[#666666] border-[rgba(0,0,0,0.08)]';

  useEffect(() => {
    if (!platform) return;

    const fetchTemplates = async () => {
      try {
        const response = await listTemplates(platform);
        setTemplates(Object.keys(response.templates));
      } catch (error) {
        console.error(error);
      }
    };

    fetchTemplates();
  }, [platform]);

  useEffect(() => {
    if (selectedTemplate && !templates.includes(selectedTemplate)) {
      setSelectedTemplate('');
      return;
    }
    if (!selectedTemplate && templates.includes(DEFAULT_REPORT_TEMPLATE)) {
      setSelectedTemplate(DEFAULT_REPORT_TEMPLATE);
    }
  }, [selectedTemplate, templates]);

  useEffect(() => {
    if (!fileId || !platform) {
      setAvailableChannels([]);
      return;
    }

    const fetchChannels = async () => {
      try {
        const response = await detectChannels(fileId, platform);
        setAvailableChannels(response.channels || []);
      } catch (error) {
        console.error(error);
        setAvailableChannels([]);
      }
    };

    fetchChannels();
  }, [fileId, platform]);

  const resetDashboardData = () => {
    setUploadedFile(null);
    setFileId(null);
    setPreview(null);
    setPreviewSortConfig(null);
    setShowPreview(true);
    setColumnTypes({});
    setAvailableChannels([]);
    setSelectedChannels([]);
    setSelectedTemplate('');
    setHasCleanedData(false);
    setCleanedTemplate('');
    setCleanedSelectionKey('');
    setErrorMessage(null);
  };

  const confirmPlatformChange = () => {
    resetDashboardData();
    setCurrentPage('dashboard');
    setPlatform(null);
    setShowPlatformConfirm(false);
  };

  const processSelectedFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Only CSV files are supported.');
      return;
    }

    setUploadedFile(file);
    setIsLoading(true);
    setErrorMessage(null);
    setHasCleanedData(false);
    setCleanedTemplate('');
    setCleanedSelectionKey('');
    setSelectedChannels([]);
    setSelectedTemplate('');
    setPreview(null);
    setPreviewSortConfig(null);
    setShowPreview(true);
    setColumnTypes({});

    try {
      const response = await uploadFile(file);
      setFileId(response.file_id);
      setPreview(buildPreview('raw', response.preview ?? {
        columns: response.columns,
        rows: response.rows,
        row_count: response.row_count,
        column_count: response.column_count,
      }));
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processSelectedFile(file);
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDraggingFile(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDraggingFile(false);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);
    const file = event.dataTransfer.files?.[0];
    if (file) await processSelectedFile(file);
  };

  const toggleChannel = (channel: string) => {
    setSelectedChannels((current) =>
      current.includes(channel)
        ? current.filter((value) => value !== channel)
        : [...current, channel],
    );
    setHasCleanedData(false);
    setCleanedTemplate('');
    setCleanedSelectionKey('');
    if (preview?.type === 'cleaned') {
      setPreview(null);
    }
    setPreviewSortConfig(null);
    setColumnTypes({});
  };

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    setShowTemplateDropdown(false);
    setHasCleanedData(false);
    setCleanedTemplate('');
    setCleanedSelectionKey('');
    if (preview?.type === 'cleaned') {
      setPreview(null);
    }
    setPreviewSortConfig(null);
    setColumnTypes({});
  };

  const handleCleanData = async () => {
    if (!fileId || !platform) {
      setErrorMessage('Upload a CSV file before cleaning.');
      return;
    }
    if (selectedChannels.length === 0) {
      setErrorMessage('Select at least one channel.');
      return;
    }
    if (!selectedTemplate) {
      setErrorMessage('Select a report template before cleaning.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await cleanData(fileId, platform, selectedChannels, selectedTemplate);
      setPreview(buildPreview('cleaned', response.preview));
      setPreviewSortConfig(null);
      setShowPreview(true);
      setColumnTypes(response.column_types || {});
      setHasCleanedData(true);
      setCleanedTemplate(response.template_name || selectedTemplate);
      setCleanedSelectionKey(selectedChannelsKey);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReportFile = async (format: 'csv' | 'xlsx') => {
    if (!fileId || !selectedTemplate || !platform) {
      setErrorMessage('Select a template before exporting.');
      return;
    }
    if (!canExportReport) {
      setErrorMessage('Clean the selected channels with the selected template before exporting.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const blob = await downloadReport(fileId, selectedTemplate, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${platform.toLowerCase()}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!platform) {
    return <PlatformGate onSelect={setPlatform} />;
  }

  if (currentPage === 'template') {
    return <TemplateDesigner onBack={() => setCurrentPage('dashboard')} />;
  }

  return (
    <DashboardShell
      platform={platform}
      onChangePlatform={() => setShowPlatformConfirm(true)}
      onOpenTemplateDesigner={() => setCurrentPage('template')}
    >
      {/* Dashboard Header with KPIs */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="flex items-center gap-3 text-2xl font-bold text-[#111111] sm:text-3xl">
              <BarChart3 className="size-8 shrink-0 text-[#FF6B35]" />
              <span className="truncate">Dashboard</span>
            </h1>
            <p className="mt-1 text-sm text-[#666666]">Manage your {platform} data exports</p>
          </div>
          <button
            onClick={() => setShowPlatformConfirm(true)}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#FF6B35] px-4 text-sm font-semibold text-[#FF6B35] transition-colors hover:bg-[#FFF0E8]"
          >
            Change Platform
          </button>
        </div>

        {/* Key Metrics Row */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <StatCard
            label="Platform"
            value={platform}
            detail={uploadedFile ? uploadedFile.name : 'No file'}
          />
          <StatCard label="Rows" value={preview?.rowCount ?? 0} detail={preview?.type === 'cleaned' ? 'Cleaned' : 'Preview'} />
          <StatCard label="Columns" value={preview?.columnCount ?? 0} detail={preview?.type === 'cleaned' ? 'Report fields' : 'Fields'} />
          <StatCard
            label="Status"
            value={
              hasCleanedData ? (
                <CheckCircle2 className="size-9 text-[#FF6B35]" />
              ) : (
                <Circle className="size-9 text-[#999999]" />
              )
            }
            detail={hasCleanedData ? 'Ready' : 'Processing'}
          />
        </div>

        {/* Status Messages */}
        {(errorMessage || isLoading) && (
          <div className="grid gap-2">
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-lg border-2 border-[#FF6B35] bg-[#FFF0E8] p-4 text-sm font-medium text-[#FF6B35] shadow-sm">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                <span className="break-words">{errorMessage}</span>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center gap-3 rounded-lg border-2 border-[#FF6B35] bg-[#FFE8D6] p-4 text-sm font-medium text-[#FF6B35] shadow-sm">
                <LoaderCircle className="size-5 shrink-0 animate-spin" />
                <span>Processing your data...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Sidebar - Workflow Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Step 1: Upload Section */}
          <section className="rounded-lg border border-[rgba(0,0,0,0.08)] bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FF6B35] text-white text-xs font-bold">1</span>
                <h2 className="text-base font-bold text-[#111111]">Upload Data</h2>
              </div>
              <p className="text-xs text-[#777777] ml-8">Import your CSV file</p>
            </div>
            <UploadDropzone
              file={uploadedFile}
              isDragging={isDraggingFile}
              inputRef={fileInputRef}
              onBrowse={handleFileUpload}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          </section>

          {/* Step 2: Channels Section */}
          <section className="rounded-lg border border-[rgba(0,0,0,0.08)] bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FF6B35] text-white text-xs font-bold">2</span>
                <h2 className="text-base font-bold text-[#111111]">Clean Data</h2>
              </div>
              <p className="text-xs text-[#777777] ml-8">Select channels, then run the cleaner</p>
            </div>
            <ChannelSelector
              channels={availableChannels}
              selectedChannels={selectedChannels}
              templates={templates}
              selectedTemplate={selectedTemplate}
              isTemplateOpen={showTemplateDropdown}
              onToggle={toggleChannel}
              onToggleTemplateOpen={() => setShowTemplateDropdown((value) => !value)}
              onSelectTemplate={handleTemplateSelect}
              onClean={handleCleanData}
              disabled={isLoading || !fileId}
            />
          </section>

          {/* Step 3: Export Section */}
          <section className="rounded-lg border border-[rgba(0,0,0,0.08)] bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FF6B35] text-white text-xs font-bold">3</span>
                <h2 className="text-base font-bold text-[#111111]">Export Report</h2>
              </div>
              <p className="text-xs text-[#777777] ml-8">Download processed data</p>
            </div>
            <ExportPanel
              selectedTemplate={selectedTemplate}
              onDownload={downloadReportFile}
              canExport={canExportReport}
              isLoading={isLoading}
              cleanedRowCount={preview?.type === 'cleaned' ? preview.rowCount : 0}
              selectedChannels={selectedChannels}
            />
          </section>
        </div>

        {/* Right Content - Data Preview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section Title */}
          <div className="mb-2 flex items-center gap-3 px-1">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#FF6B35]/10 text-[#FF6B35]">
              <ClipboardList className="size-4" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#111111]">Data Preview</h2>
              <p className="text-sm text-[#666666]">One preview switches from raw upload rows to cleaned report rows</p>
            </div>
          </div>

          <div className="flex justify-end">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${previewBadgeClass}`}>
              {previewBadge}
            </span>
          </div>

          {/* Single Preview Table */}
          <div className="grid gap-4 grid-cols-1">
            <DataTable
              title={previewTitle}
              subtitle={previewSubtitle}
              columns={preview?.columns ?? []}
              rows={sortedPreviewRows}
              sortConfig={previewSortConfig}
              onSort={(key) => setPreviewSortConfig((current) => nextSortConfig(current, key))}
              isOpen={showPreview}
              onToggle={() => setShowPreview((value) => !value)}
            />

            <ColumnTypesPanel
              entries={columnTypesEntries}
              isOpen={showColumnTypes}
              onToggle={() => setShowColumnTypes((value) => !value)}
            />
          </div>
        </div>
      </div>

      {showPlatformConfirm && (
        <ConfirmDialog
          title="Change platform?"
          message="Changing the platform will clear the uploaded file, detected channels, cleaned preview, selected template, and current export state."
          confirmLabel="Change platform"
          onConfirm={confirmPlatformChange}
          onCancel={() => setShowPlatformConfirm(false)}
        />
      )}
    </DashboardShell>
  );
}
