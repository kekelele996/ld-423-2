import { ChartConfig, ChartType, ColorScheme } from '../types';

export const createDefaultChartConfig = (datasetId: string, xField = '', yField = ''): ChartConfig => ({
  id: crypto.randomUUID(),
  datasetId,
  name: '未命名图表',
  type: ChartType.Scatter,
  xField,
  yField,
  colorScheme: ColorScheme.Scientific,
  title: '科研数据图表',
  subtitle: '实时预览',
  legendPosition: 'top',
  customStyle: {},
  tags: ['analysis'],
});
