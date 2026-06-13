export interface ReportLayoutItem {
  chartId: string;
  row: number;
  col: number;
  width: number;
  height: number;
}

export interface Report {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  chartIds: string[];
  layout: ReportLayoutItem[];
  exportStatus: 'Draft' | 'Ready' | 'Exported';
}
