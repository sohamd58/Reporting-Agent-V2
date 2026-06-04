export type Platform = 'Clevertap' | 'Moengage';

export type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export type PreviewType = 'raw' | 'cleaned';

export type PreviewState = {
  type: PreviewType;
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  columnCount: number;
};
