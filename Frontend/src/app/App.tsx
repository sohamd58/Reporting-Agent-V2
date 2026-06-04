import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Download, Info, FileText, Database, CheckCircle2, Upload, Menu, X, User, Calendar, Mail, Building, Sparkles } from 'lucide-react';
import TemplateDesigner from './components/TemplateDesigner';
import {
  cleanData,
  detectChannels,
  downloadReport,
  listTemplates,
  uploadFile,
} from './api';

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export default function App() {
  const [platform, setPlatform] = useState<'Clevertap' | 'Moengage'>('Clevertap');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [rawSortConfig, setRawSortConfig] = useState<SortConfig>(null);
  const [cleanedSortConfig, setCleanedSortConfig] = useState<SortConfig>(null);
  const [showRawPreview, setShowRawPreview] = useState(true);
  const [showCleanedPreview, setShowCleanedPreview] = useState(true);
  const [showColumnTypes, setShowColumnTypes] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState<'main' | 'template'>('main');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [hasCleanedData, setHasCleanedData] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const [rawPreview, setRawPreview] = useState<Record<string, unknown>[]>([]);
  const [rawColumns, setRawColumns] = useState<string[]>([]);
  const [rawRowCount, setRawRowCount] = useState(0);
  const [rawColumnCount, setRawColumnCount] = useState(0);
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);
  const [cleanedPreview, setCleanedPreview] = useState<Record<string, unknown>[]>([]);
  const [cleanedColumns, setCleanedColumns] = useState<string[]>([]);
  const [cleanedRowCount, setCleanedRowCount] = useState(0);
  const [columnTypes, setColumnTypes] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rawData = rawPreview;
  const cleanedData = cleanedPreview;

  const handleChannelToggle = (channel: string) => {
    setSelectedChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSort = (key: string, isCleaned: boolean) => {
    const config = isCleaned ? cleanedSortConfig : rawSortConfig;
    const setConfig = isCleaned ? setCleanedSortConfig : setRawSortConfig;

    let direction: 'asc' | 'desc' = 'asc';
    if (config && config.key === key && config.direction === 'asc') {
      direction = 'desc';
    }
    setConfig({ key, direction });
  };

  const sortData = (data: any[], config: SortConfig) => {
    if (!config) return data;

    return [...data].sort((a, b) => {
      const aVal = a[config.key];
      const bVal = b[config.key];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return config.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (config.direction === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return bStr < aStr ? -1 : bStr > aStr ? 1 : 0;
      }
    });
  };

  const sortedRawData = sortData(rawData, rawSortConfig).slice(0, 10);
  const sortedCleanedData = sortData(cleanedData, cleanedSortConfig).slice(0, 10);
  const rawHeaderColumns = rawColumns.length > 0 ? rawColumns : Object.keys(rawData[0] || {});
  const cleanedHeaderColumns = cleanedColumns.length > 0
    ? cleanedColumns
    : Object.keys(cleanedData[0] || rawData[0] || {});

  const columnTypesEntries = Object.entries(columnTypes);

  useEffect(() => {
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
    if (selectedFormat && !templates.includes(selectedFormat)) {
      setSelectedFormat('');
    }
  }, [selectedFormat, templates]);

  useEffect(() => {
    if (!fileId) {
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

  const downloadReportFile = async (format: 'csv' | 'xlsx') => {
    if (!fileId || !selectedFormat) {
      setErrorMessage('Select a template before exporting.');
      return;
    }
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const blob = await downloadReport(fileId, selectedFormat, format);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsLoading(true);
    setErrorMessage(null);
    setHasCleanedData(false);
    setSelectedChannels([]);
    setSelectedFormat('');
    try {
      const response = await uploadFile(file);
      setFileId(response.file_id);
      setRawPreview(response.rows);
      setRawColumns(response.columns);
      setRawRowCount(response.row_count);
      setRawColumnCount(response.column_count);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTemplates = templates;

  const handleCleanData = async () => {
    if (!fileId) {
      setErrorMessage('Upload a CSV file before cleaning.');
      return;
    }
    if (selectedChannels.length === 0) {
      setErrorMessage('Select at least one channel.');
      return;
    }
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await cleanData(fileId, platform, selectedChannels);
      setCleanedPreview(response.preview.rows);
      setCleanedColumns(response.preview.columns);
      setCleanedRowCount(response.preview.row_count);
      setColumnTypes(response.column_types || {});
      setHasCleanedData(true);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentPage === 'template') {
    return <TemplateDesigner onBack={() => setCurrentPage('main')} />;
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex">
      {/* Sidebar */}
      <aside
        className={`bg-[#F4F5F6] border-r border-[rgba(0,0,0,0.08)] transition-all duration-300 ${
          sidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-[rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <h2 className="text-[#111111]">Navigation</h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-[#666666] hover:text-[#FF6B35] transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 p-6">
            <button
              onClick={() => setCurrentPage('template')}
              className="w-full bg-[#FF6B35] text-white px-6 py-4 rounded-md flex items-center justify-center gap-3 transition-all duration-200 hover:bg-white hover:text-[#FF6B35] hover:shadow-md active:scale-95 border-2 border-[#FF6B35] group"
            >
              <Building className="w-5 h-5" />
              <span>Template Designer</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-[#F4F5F6] border-b border-[rgba(0,0,0,0.08)]">
          <div className="px-8 py-6">
            <div className="flex items-baseline gap-3">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-[#666666] hover:text-[#FF6B35] transition-colors duration-200 mr-2"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              <h1 className="text-[#111111]">Tribe.</h1>
              <span className="text-sm text-[#666666] tracking-wide">Monday Report Builder</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">
        {/* Section 1: Platform Selection & Data Overview */}
        <section className="bg-white rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 space-y-8 transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#FF6B35] rounded-full"></div>
            <h2 className="text-[#111111]">Data Source Configuration</h2>
          </div>

          {/* Platform Selector and File Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Platform Selector */}
            <div className="space-y-3">
              <label className="text-[#111111] block">Select Platform</label>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full bg-[#F4F5F6] px-4 py-3 rounded-md flex items-center justify-between text-[#111111] transition-all duration-200 hover:bg-[#EFEFEF] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2"
                >
                  <span>{platform}</span>
                  <ChevronDown className="w-5 h-5 text-[#666666] transition-transform duration-200" style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {showDropdown && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-md shadow-lg overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                    {(['Clevertap', 'Moengage'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setPlatform(p);
                          setShowDropdown(false);
                          setSelectedChannels([]);
                        }}
                        className="w-full px-4 py-3 text-left text-[#111111] hover:bg-[#F4F5F6] transition-colors duration-150 flex items-center gap-2 group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#FF6B35] transition-colors duration-150"></span>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <label className="text-[#111111] block">Upload Source File</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-[#F4F5F6] px-4 py-3 rounded-md flex items-center justify-between cursor-pointer transition-all duration-200 hover:bg-[#EFEFEF] border-2 border-dashed border-transparent hover:border-[#FF6B35] group"
              >
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-[#666666] group-hover:text-[#FF6B35] transition-colors duration-200" />
                  <span className="text-[#111111] text-sm">
                    {uploadedFile ? uploadedFile.name : 'Click to upload CSV file'}
                  </span>
                </div>
                {uploadedFile && (
                  <CheckCircle2 className="w-5 h-5 text-[#FF6B35]" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#F4F5F6] rounded-md p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#111111]">
              <Info className="w-5 h-5 text-[#FF6B35]" />
              <h3>Data Overview</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-md p-4 space-y-2">
                <div className="text-sm text-[#666666]">Available Channels</div>
                <div className="text-[#111111] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#FF6B35]" />
                  {availableChannels.length > 0 ? availableChannels.join(', ') : 'None detected'}
                </div>
              </div>
              <div className="bg-white rounded-md p-4 space-y-2">
                <div className="text-sm text-[#666666]">Total Rows</div>
                <div className="text-2xl text-[#111111]">{rawRowCount}</div>
              </div>
              <div className="bg-white rounded-md p-4 space-y-2">
                <div className="text-sm text-[#666666]">Total Columns</div>
                <div className="text-2xl text-[#111111]">{rawColumnCount}</div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-white border border-[#FF6B35]/40 text-[#111111] rounded-md p-4 text-sm">
              {errorMessage}
            </div>
          )}
          {isLoading && (
            <div className="text-sm text-[#666666]">Working on it...</div>
          )}

          {/* Raw Data Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[#111111]">Raw Data Preview (First 10 Rows)</h3>
              <button
                onClick={() => setShowRawPreview(!showRawPreview)}
                className="text-[#666666] hover:text-[#FF6B35] transition-colors duration-200 flex items-center gap-2"
              >
                <span className="text-sm">{showRawPreview ? 'Collapse' : 'Expand'}</span>
                {showRawPreview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            {showRawPreview && (
              <div className="overflow-x-auto rounded-md border border-[rgba(0,0,0,0.08)] animate-in fade-in slide-in-from-top-2 duration-200">
              <table className="w-full">
                <thead className="bg-[#F4F5F6]">
                  <tr>
                    {rawHeaderColumns.map((key) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key, false)}
                        className="px-4 py-3 text-left text-sm text-[#111111] cursor-pointer hover:bg-[#EFEFEF] transition-colors duration-150 select-none group"
                      >
                        <div className="flex items-center gap-2">
                          {key.replace(/_/g, ' ').toUpperCase()}
                          <span className="opacity-0 group-hover:opacity-100 text-[#FF6B35] transition-opacity duration-150">
                            {rawSortConfig?.key === key && (rawSortConfig.direction === 'asc' ? '↑' : '↓')}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {sortedRawData.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-[rgba(0,0,0,0.04)] hover:bg-[#FAF9F6] transition-colors duration-150"
                    >
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="px-4 py-3 text-sm text-[#111111]">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </section>

        {/* Section 2: Channel Selection & Data Cleaning */}
        <section className="bg-white rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 space-y-8 transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#FF6B35] rounded-full"></div>
            <h2 className="text-[#111111]">Channel Filtering & Cleaning</h2>
          </div>

          {/* Channel Selection */}
          <div className="space-y-4">
            <h3 className="text-[#111111]">Select Channels for Report</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {availableChannels.map((channel) => (
                <button
                  key={channel}
                  onClick={() => handleChannelToggle(channel)}
                  className={`px-4 py-3 rounded-md border transition-all duration-200 flex items-center gap-2 ${
                    selectedChannels.includes(channel)
                      ? 'bg-[#FF6B35] border-[#FF6B35] text-white shadow-sm'
                      : 'bg-[#F4F5F6] border-transparent text-[#111111] hover:border-[#FF6B35]'
                  }`}
                >
                  {selectedChannels.includes(channel) && (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {channel}
                </button>
              ))}
            </div>
          </div>

          {/* Format Template Selector */}
          {selectedChannels.length > 0 && (
            <div className="space-y-3">
              <label className="text-[#111111] block">Select Report Format</label>
              <div className="relative">
                <button
                  onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                  className="w-full max-w-md bg-[#F4F5F6] px-4 py-3 rounded-md flex items-center justify-between text-[#111111] transition-all duration-200 hover:bg-[#EFEFEF] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2"
                >
                  <span>{selectedFormat || 'Choose a format template'}</span>
                  <ChevronDown className="w-5 h-5 text-[#666666] transition-transform duration-200" style={{ transform: showFormatDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {showFormatDropdown && (
                  <div className="absolute top-full mt-2 w-full max-w-md bg-white border border-[rgba(0,0,0,0.08)] rounded-md shadow-lg overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
                    {formatTemplates.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-[#666666]">No templates available.</div>
                    ) : (
                      formatTemplates.map((format) => (
                        <button
                          key={format}
                          onClick={() => {
                            setSelectedFormat(format);
                            setShowFormatDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-[#111111] hover:bg-[#F4F5F6] transition-colors duration-150 flex items-center gap-2 group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#FF6B35] transition-colors duration-150"></span>
                          {format}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clean Data Button */}
          {selectedChannels.length > 0 && selectedFormat && (
            <div>
              <button
                onClick={handleCleanData}
                className="px-6 py-3 bg-[#FF6B35] text-white rounded-md flex items-center gap-2 hover:bg-[#FF8C00] transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <Sparkles className="w-5 h-5" />
                Clean Data
              </button>
            </div>
          )}

          {/* Cleaned Data Preview */}
          {hasCleanedData && selectedChannels.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-[#111111]">Cleaned Data Preview (First 10 Rows)</h3>
                  <div className="text-sm text-[#666666]">
                    Showing {cleanedRowCount} rows after cleaning
                  </div>
                </div>
                <button
                  onClick={() => setShowCleanedPreview(!showCleanedPreview)}
                  className="text-[#666666] hover:text-[#FF6B35] transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="text-sm">{showCleanedPreview ? 'Collapse' : 'Expand'}</span>
                  {showCleanedPreview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
              {showCleanedPreview && (
                <div className="overflow-x-auto rounded-md border border-[rgba(0,0,0,0.08)] animate-in fade-in slide-in-from-top-2 duration-200">
                <table className="w-full">
                  <thead className="bg-[#F4F5F6]">
                    <tr>
                      {cleanedHeaderColumns.map((key) => (
                        <th
                          key={key}
                          onClick={() => handleSort(key, true)}
                          className="px-4 py-3 text-left text-sm text-[#111111] cursor-pointer hover:bg-[#EFEFEF] transition-colors duration-150 select-none group"
                        >
                          <div className="flex items-center gap-2">
                            {key.replace(/_/g, ' ').toUpperCase()}
                            <span className="opacity-0 group-hover:opacity-100 text-[#FF6B35] transition-opacity duration-150">
                              {cleanedSortConfig?.key === key && (cleanedSortConfig.direction === 'asc' ? '↑' : '↓')}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {sortedCleanedData.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-[rgba(0,0,0,0.04)] hover:bg-[#FAF9F6] transition-colors duration-150"
                      >
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="px-4 py-3 text-sm text-[#111111]">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          )}

          {/* Column Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[#111111]">Column Data Types</h3>
              <button
                onClick={() => setShowColumnTypes(!showColumnTypes)}
                className="text-[#666666] hover:text-[#FF6B35] transition-colors duration-200 flex items-center gap-2"
              >
                <span className="text-sm">{showColumnTypes ? 'Collapse' : 'Expand'}</span>
                {showColumnTypes ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            {showColumnTypes && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                {columnTypesEntries.map(([col, type]) => (
                <div
                  key={col}
                  className="bg-[#F4F5F6] rounded-md px-4 py-3 flex items-center justify-between group hover:bg-[#EFEFEF] transition-colors duration-150"
                >
                  <span className="text-[#111111]">{col.replace(/_/g, ' ')}</span>
                  <span className="text-sm text-[#666666] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity duration-150"></span>
                    {type}
                  </span>
                </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Export Options */}
        <section className="bg-white rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 space-y-6 transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#FF6B35] rounded-full"></div>
            <h2 className="text-[#111111]">Export Report</h2>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => downloadReportFile('csv')}
              disabled={!hasCleanedData || !selectedFormat || isLoading}
              className="px-6 py-3 bg-[#FF6B35] text-white rounded-md flex items-center gap-2 hover:bg-[#FF8C00] transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Download as CSV
            </button>
            <button
              onClick={() => downloadReportFile('xlsx')}
              disabled={!hasCleanedData || !selectedFormat || isLoading}
              className="px-6 py-3 bg-[#F4F5F6] text-[#111111] rounded-md flex items-center gap-2 hover:bg-[#EFEFEF] transition-all duration-200 border border-[rgba(0,0,0,0.08)] hover:border-[#FF6B35] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Download as Excel
            </button>
          </div>

          <div className="text-sm text-[#666666] bg-[#F4F5F6] rounded-md p-4">
            {selectedChannels.length > 0
              ? `Exporting cleaned data with ${cleanedRowCount} rows filtered by channels: ${selectedChannels.join(', ')}`
              : `Exporting complete raw data with ${rawRowCount} rows`
            }
          </div>
        </section>
          </div>
        </div>
      </div>
    </div>
  );
}
