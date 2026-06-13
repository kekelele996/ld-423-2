import { useMemo, useState } from 'react';
import { DataGrid } from '../components/common/DataGrid';
import { FieldSelector } from '../components/common/FieldSelector';
import { StatCard } from '../components/common/StatCard';
import { useDatasetStore } from '../stores/datasetStore';
import { calculateStatSummary, correlation } from '../utils/statistics';
import { DataType } from '../types';

export const Statistics = () => {
  const datasets = useDatasetStore((state) => state.datasets);
  const dataset = datasets[0];
  const numericColumns = dataset.columns.filter((column) => column.type === 'Number');
  const [field, setField] = useState(numericColumns[0]?.name ?? '');
  const summary = useMemo(() => calculateStatSummary(dataset.id, dataset.data, field), [dataset, field]);
  const matrixRows = numericColumns.map((column) => ({
    field: column.name,
    ...Object.fromEntries(numericColumns.map((other) => [other.name, Number(correlation(dataset.data, column.name, other.name).toFixed(3))])),
  }));

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Statistics</span>
          <h1>统计分析</h1>
        </div>
        <FieldSelector label="分析字段" columns={dataset.columns} value={field} numericOnly onChange={setField} />
      </section>
      <section className="stats-grid">
        <StatCard label="均值" value={summary.mean} />
        <StatCard label="中位数" value={summary.median} />
        <StatCard label="标准差" value={summary.standardDeviation} />
        <StatCard label="最小值" value={summary.min} />
        <StatCard label="最大值" value={summary.max} />
        <StatCard label="空值数" value={summary.nullCount} />
      </section>
      <section className="analysis-block">
        <h2>相关性矩阵</h2>
        <DataGrid rows={matrixRows} columns={[{ name: 'field', type: DataType.String }, ...numericColumns]} maxHeight={320} />
      </section>
    </main>
  );
};
