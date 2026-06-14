import { ColumnDefinition, DataType, DatasetRow, Filter, FilterOperator } from '../types';

const parseNumericValue = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const numeric = Number(value.trim());
    return Number.isFinite(numeric) ? numeric : null;
  }
  return null;
};

const splitDelimited = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter((item) => item !== '');
  if (typeof value === 'number' || typeof value === 'boolean') return [String(value)];
  return [];
};

const splitNumericRange = (value: unknown): [number | null, number | null] => {
  const parts = splitDelimited(value);
  return [parseNumericValue(parts[0] ?? null), parseNumericValue(parts[1] ?? null)];
};

export const isFilterValid = (filter: Filter): boolean => {
  if (typeof filter.value === 'string' && filter.value.trim() === '') return false;
  if (Array.isArray(filter.value) && filter.value.length === 0) return false;
  if (filter.value === null || filter.value === undefined) return false;
  if (filter.operator === FilterOperator.Between) {
    const [min, max] = splitNumericRange(filter.value);
    return min !== null && max !== null;
  }
  if (filter.operator === FilterOperator.In) {
    return splitDelimited(filter.value).length > 0;
  }
  return true;
};

const matchRow = (row: DatasetRow, filter: Filter, columnType: DataType | undefined): boolean => {
  const cell = row[filter.fieldName];
  const isNumericColumn = columnType === DataType.Number;

  if (cell === null || cell === undefined || (typeof cell === 'string' && cell === '')) {
    return false;
  }

  switch (filter.operator) {
    case FilterOperator.Equals: {
      if (isNumericColumn) {
        const left = parseNumericValue(cell);
        const right = parseNumericValue(filter.value);
        if (left === null || right === null) return false;
        return left === right;
      }
      return String(cell).toLowerCase() === String(filter.value).toLowerCase();
    }
    case FilterOperator.Contains: {
      return String(cell).toLowerCase().includes(String(filter.value).toLowerCase());
    }
    case FilterOperator.GreaterThan: {
      const left = parseNumericValue(cell);
      const right = parseNumericValue(filter.value);
      if (left === null || right === null) return false;
      return left > right;
    }
    case FilterOperator.LessThan: {
      const left = parseNumericValue(cell);
      const right = parseNumericValue(filter.value);
      if (left === null || right === null) return false;
      return left < right;
    }
    case FilterOperator.Between: {
      const left = parseNumericValue(cell);
      const [min, max] = splitNumericRange(filter.value);
      if (left === null || min === null || max === null) return false;
      return left >= min && left <= max;
    }
    case FilterOperator.In: {
      const candidates = splitDelimited(filter.value).map((item) => item.toLowerCase());
      if (isNumericColumn) {
        const left = parseNumericValue(cell);
        if (left === null) return false;
        return candidates.some((item) => {
          const numeric = parseNumericValue(item);
          return numeric !== null && numeric === left;
        });
      }
      return candidates.includes(String(cell).toLowerCase());
    }
    default:
      return true;
  }
};

export const applyFilters = (
  rows: DatasetRow[],
  filters: Filter[],
  columns: ColumnDefinition[],
): DatasetRow[] => {
  const active = filters.filter((filter) => filter.active && isFilterValid(filter));
  if (active.length === 0) return rows;
  const columnMap = new Map(columns.map((column) => [column.name, column.type]));
  return rows.filter((row) => active.every((filter) => matchRow(row, filter, columnMap.get(filter.fieldName))));
};
