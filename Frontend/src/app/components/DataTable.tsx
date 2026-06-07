import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react';
import type { SortConfig } from '../types';

type DataTableProps = {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: Record<string, unknown>[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  isOpen: boolean;
  onToggle: () => void;
};

function isPercentageColumn(column: string) {
  const normalized = column.trim().toLowerCase();
  const compact = normalized.replace(/\s+/g, '');
  return (
    normalized.includes('%') ||
    normalized.includes('rate') ||
    compact === 'ctr' ||
    compact.endsWith('ctr') ||
    compact === 'ctor' ||
    compact.endsWith('ctor')
  );
}

function parseNumber(value: unknown) {
  const numeric = Number(String(value ?? '').replace(/[%,$,]/g, '').trim());
  return Number.isFinite(numeric) ? numeric : null;
}

function blank(value: unknown) {
  const text = String(value ?? '').trim();
  return !text || ['nan', 'nat', '<na>', 'none', '-'].includes(text.toLowerCase());
}

function formatPercent(value: unknown) {
  if (blank(value)) return '-';
  const text = String(value).trim();
  if (text.endsWith('%')) return text;
  const numeric = parseNumber(value);
  return numeric === null ? text : `${numeric.toFixed(2)}%`;
}

function calculatedPercentage(row: Record<string, unknown>, key: string) {
  const numerator =
    key === 'Impression %'
      ? parseNumber(row.Impression ?? row['Total Impressions'])
      : key === 'Clicked%' || key === 'Clicked %'
        ? parseNumber(row.Clicked ?? row['Total Clicks'])
        : null;
  const denominator = parseNumber(row['Total Sent'] ?? row.Sent);

  if (numerator === null || denominator === null || denominator === 0) return null;
  return `${((numerator / denominator) * 100).toFixed(2)}%`;
}

function displayValue(row: Record<string, unknown>, key: string) {
  const value = row[key];
  if (!isPercentageColumn(key)) {
    return blank(value) ? '-' : String(value);
  }

  if (blank(value)) {
    return calculatedPercentage(row, key) ?? '-';
  }

  return formatPercent(value);
}

export default function DataTable({
  title,
  subtitle,
  columns,
  rows,
  sortConfig,
  onSort,
  isOpen,
  onToggle,
}: DataTableProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/70 shadow-sm backdrop-blur-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-col gap-3 border-b border-[rgba(0,0,0,0.04)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[#111111]">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-[#666666]">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#EFEFEF] px-4 text-sm font-medium text-[#111111] transition duration-200 hover:border-[#FF6B35] hover:text-[#FF6B35] hover:shadow-sm active:scale-95"
        >
          {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          {isOpen ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isOpen && (
        <>
          <div className="grid gap-3 p-4 md:hidden">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-[#F4F5F6] px-4 py-12 text-center text-sm font-medium text-[#666666]">
                <FileSpreadsheet className="size-5 text-[#FF6B35]" />
                No preview data yet
              </div>
            ) : (
              rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="rounded-lg border border-[rgba(0,0,0,0.08)] bg-white p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B35]">
                      Row {rowIndex + 1}
                    </span>
                    <span className="rounded-full bg-[#FFE8D6] px-2 py-1 text-xs text-[#FF6B35]">
                      Preview
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {columns.slice(0, 6).map((key) => (
                      <div key={key} className="border-l-2 border-[#FFB399] pl-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-[#FF6B35]">
                          {key}
                        </div>
                        <div className="mt-1 break-words text-sm font-medium text-[#111111]">
                          {displayValue(row, key)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden max-w-full overflow-x-auto md:block">
            <table className="w-max min-w-full">
              <thead className="border-b border-[rgba(0,0,0,0.08)] bg-[#F4F5F6]">
                <tr>
                  {columns.map((key) => {
                    const isSorted = sortConfig?.key === key;
                    return (
                      <th
                        key={key}
                        onClick={() => onSort(key)}
                        className="cursor-pointer select-none whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#FF6B35] transition duration-150 hover:bg-[#FFF0E8]"
                      >
                        <span className="inline-flex items-center gap-2">
                          {key}
                          {isSorted && sortConfig.direction === 'asc' && <ArrowUp className="size-3" />}
                          {isSorted && sortConfig.direction === 'desc' && <ArrowDown className="size-3" />}
                          {!isSorted && <ArrowUpDown className="size-3 text-slate-400" />}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,0,0,0.04)]">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      className="px-6 py-12 text-center text-sm font-medium text-[#666666]"
                      colSpan={Math.max(columns.length, 1)}
                    >
                      No preview data available
                    </td>
                  </tr>
                ) : (
                  rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-[rgba(0,0,0,0.04)] transition-colors duration-100 hover:bg-[#FFF0E8]"
                    >
                      {columns.map((key) => (
                        <td key={key} className="max-w-xs px-6 py-3 text-sm font-medium text-[#111111]">
                          <span className="block truncate" title={displayValue(row, key)}>
                            {displayValue(row, key)}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
