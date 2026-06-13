import { DatasetRow, StatSummary } from '../types';

const toNumbers = (rows: DatasetRow[], field: string) =>
  rows.map((row) => row[field]).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

export const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

export const quantile = (values: number[], percentile: number) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * percentile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return lower === upper ? sorted[lower] : sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
};

export const standardDeviation = (values: number[]) => {
  if (values.length < 2) return 0;
  const avg = mean(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1));
};

export const calculateStatSummary = (datasetId: string, rows: DatasetRow[], fieldName: string): StatSummary => {
  const values = rows.map((row) => row[fieldName]).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const nullCount = rows.filter((row) => row[fieldName] === null || row[fieldName] === undefined || row[fieldName] === '').length;
  if (values.length === 0) {
    return { datasetId, fieldName, mean: 0, median: 0, standardDeviation: 0, min: 0, max: 0, quartiles: { q1: 0, q2: 0, q3: 0 }, nullCount };
  }
  return {
    datasetId,
    fieldName,
    mean: mean(values),
    median: quantile(values, 0.5),
    standardDeviation: standardDeviation(values),
    min: Math.min(...values),
    max: Math.max(...values),
    quartiles: {
      q1: quantile(values, 0.25),
      q2: quantile(values, 0.5),
      q3: quantile(values, 0.75),
    },
    nullCount,
  };
};

export const correlation = (rows: DatasetRow[], xField: string, yField: string) => {
  const pairs = rows
    .map((row) => [row[xField], row[yField]])
    .filter((pair): pair is [number, number] => typeof pair[0] === 'number' && typeof pair[1] === 'number');
  if (pairs.length < 2) return 0;
  const xs = pairs.map(([x]) => x);
  const ys = pairs.map(([, y]) => y);
  const xMean = mean(xs);
  const yMean = mean(ys);
  const numerator = pairs.reduce((sum, [x, y]) => sum + (x - xMean) * (y - yMean), 0);
  const denominator = Math.sqrt(xs.reduce((sum, x) => sum + (x - xMean) ** 2, 0) * ys.reduce((sum, y) => sum + (y - yMean) ** 2, 0));
  return denominator === 0 ? 0 : numerator / denominator;
};
