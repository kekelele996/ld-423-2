import { ChartType, ColorScheme, DataType, Dataset, FilterOperator } from '../types';
import { createDefaultChartConfig } from '../constants/chartDefaults';

export const sampleDataset: Dataset = {
  id: 'dataset-demo-growth',
  name: '细胞培养增长实验',
  description: '不同培养条件下的 OD600 和产物表达量。',
  sourceFileName: 'cell-growth-demo.csv',
  importedAt: new Date().toISOString(),
  rowCount: 8,
  columnCount: 5,
  columns: [
    { name: 'day', type: DataType.Number },
    { name: 'temperature', type: DataType.Number },
    { name: 'od600', type: DataType.Number },
    { name: 'yield', type: DataType.Number },
    { name: 'group', type: DataType.String },
  ],
  tags: ['demo', 'cell'],
  data: [
    { day: 1, temperature: 30, od600: 0.21, yield: 1.8, group: 'A' },
    { day: 2, temperature: 30, od600: 0.48, yield: 3.6, group: 'A' },
    { day: 3, temperature: 30, od600: 0.91, yield: 6.4, group: 'A' },
    { day: 4, temperature: 30, od600: 1.28, yield: 8.1, group: 'A' },
    { day: 1, temperature: 37, od600: 0.26, yield: 1.4, group: 'B' },
    { day: 2, temperature: 37, od600: 0.69, yield: 4.8, group: 'B' },
    { day: 3, temperature: 37, od600: 1.18, yield: 7.2, group: 'B' },
    { day: 4, temperature: 37, od600: 1.47, yield: 7.9, group: 'B' },
  ],
};

export const sampleChart = {
  ...createDefaultChartConfig(sampleDataset.id, 'day', 'yield'),
  id: 'chart-demo-yield',
  name: '培养周期与表达量',
  type: ChartType.Line,
  colorScheme: ColorScheme.Scientific,
};

export const sampleFilter = {
  id: 'filter-demo-group-a',
  datasetId: sampleDataset.id,
  fieldName: 'group',
  operator: FilterOperator.Equals,
  value: 'A',
  active: false,
};
