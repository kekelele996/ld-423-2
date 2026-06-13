import Papa from 'papaparse';
import { ColumnDefinition, DatasetRow, DataType } from '../types';

const coerceValue = (value: unknown): string | number | boolean | null => {
  if (value === '' || value === null || value === undefined) return null;
  if (typeof value === 'boolean' || typeof value === 'number') return value;
  const trimmed = String(value).trim();
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === 'true';
  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric) && trimmed !== '') return numeric;
  return trimmed;
};

export const inferDataType = (values: unknown[]): DataType => {
  const nonEmpty = values.filter((value) => value !== null && value !== undefined && value !== '');
  if (nonEmpty.length === 0) return DataType.String;
  if (nonEmpty.every((value) => typeof coerceValue(value) === 'number')) return DataType.Number;
  if (nonEmpty.every((value) => /^(true|false)$/i.test(String(value)))) return DataType.Boolean;
  if (nonEmpty.every((value) => !Number.isNaN(Date.parse(String(value))))) return DataType.Date;
  return DataType.String;
};

export const buildColumns = (rows: DatasetRow[]): ColumnDefinition[] => {
  const keys = Object.keys(rows[0] ?? {});
  return keys.map((name) => ({ name, type: inferDataType(rows.map((row) => row[name])) }));
};

export const parseCsv = (text: string): Promise<DatasetRow[]> =>
  new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          reject(new Error(result.errors.map((error) => error.message).join('; ')));
          return;
        }
        resolve(result.data.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, coerceValue(value)]))));
      },
      error: (error: Error) => reject(error),
    });
  });

export const parseJsonRows = (text: string): DatasetRow[] => {
  const parsed = JSON.parse(text) as unknown;
  const rows = Array.isArray(parsed) ? parsed : typeof parsed === 'object' && parsed ? Object.values(parsed) : [];
  if (!Array.isArray(rows) || rows.some((row) => typeof row !== 'object' || row === null)) {
    throw new Error('JSON 必须是对象数组或包含对象集合的结构');
  }
  return rows.map((row) => Object.fromEntries(Object.entries(row as Record<string, unknown>).map(([key, value]) => [key, coerceValue(value)])));
};
