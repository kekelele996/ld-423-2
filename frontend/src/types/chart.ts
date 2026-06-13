import { ChartType, ColorScheme } from './enums';

export interface ChartConfig {
  id: string;
  datasetId: string;
  name: string;
  type: ChartType;
  xField: string;
  yField: string;
  groupField?: string;
  colorScheme: ColorScheme;
  title: string;
  subtitle?: string;
  legendPosition: 'top' | 'right' | 'bottom' | 'left';
  customStyle: Record<string, unknown>;
  tags: string[];
}
