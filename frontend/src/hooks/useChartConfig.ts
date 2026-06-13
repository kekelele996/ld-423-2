import { useMemo } from 'react';
import { ChartConfig, Dataset } from '../types';
import { createDefaultChartConfig } from '../constants/chartDefaults';

export const useChartConfig = (dataset?: Dataset) => {
  const suggestedConfig = useMemo(() => {
    if (!dataset) return undefined;
    const numeric = dataset.columns.find((column) => column.type === 'Number');
    return createDefaultChartConfig(dataset.id, dataset.columns[0]?.name ?? '', numeric?.name ?? dataset.columns[1]?.name ?? '');
  }, [dataset]);

  const validateConfig = (config: ChartConfig) => {
    const errors: string[] = [];
    if (!config.datasetId) errors.push('请选择数据集');
    if (!config.xField) errors.push('请选择 X 轴字段');
    if (!config.yField) errors.push('请选择 Y 轴字段');
    return errors;
  };

  return { suggestedConfig, validateConfig };
};
