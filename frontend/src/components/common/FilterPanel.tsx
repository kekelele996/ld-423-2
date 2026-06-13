import { useMemo } from 'react';
import { DataType, FilterOperator } from '../../types';
import { useFilterStore } from '../../stores/filterStore';
import { useDatasetStore } from '../../stores/datasetStore';

interface FilterPanelProps {
  datasetId: string;
}

export const FilterPanel = ({ datasetId }: FilterPanelProps) => {
  const dataset = useDatasetStore((state) => state.datasets.find((candidate) => candidate.id === datasetId));
  const allFilters = useFilterStore((state) => state.filters);
  const filters = useMemo(() => allFilters.filter((filter) => filter.datasetId === datasetId), [allFilters, datasetId]);
  const addFilter = useFilterStore((state) => state.addFilter);
  const updateFilter = useFilterStore((state) => state.updateFilter);
  const toggleFilter = useFilterStore((state) => state.toggleFilter);
  const removeFilter = useFilterStore((state) => state.removeFilter);

  if (!dataset) return null;

  return (
    <aside className="filter-panel">
      <div className="panel-heading">
        <h3>筛选器</h3>
        <button type="button" onClick={() => addFilter(datasetId, dataset.columns[0]?.name ?? '')}>
          添加
        </button>
      </div>
      {filters.map((filter) => (
        <div className="filter-row" key={filter.id}>
          <input type="checkbox" checked={filter.active} onChange={() => toggleFilter(filter.id)} aria-label="启用筛选" />
          <select value={filter.fieldName} onChange={(event) => updateFilter({ ...filter, fieldName: event.target.value })}>
            {dataset.columns.map((column) => (
              <option key={column.name} value={column.name}>
                {column.name}
              </option>
            ))}
          </select>
          <select value={filter.operator} onChange={(event) => updateFilter({ ...filter, operator: event.target.value as FilterOperator })}>
            {Object.values(FilterOperator).map((operator) => (
              <option key={operator} value={operator}>
                {operator}
              </option>
            ))}
          </select>
          <input
            value={String(filter.value)}
            type={dataset.columns.find((column) => column.name === filter.fieldName)?.type === DataType.Number ? 'number' : 'text'}
            onChange={(event) => updateFilter({ ...filter, value: event.target.value })}
          />
          <button type="button" onClick={() => removeFilter(filter.id)}>
            删除
          </button>
        </div>
      ))}
    </aside>
  );
};
