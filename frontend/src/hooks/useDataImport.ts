import { useState } from 'react';
import { Dataset } from '../types';
import { buildColumns, parseCsv, parseJsonRows } from '../utils/csvParser';

export const useDataImport = () => {
  const [error, setError] = useState<string | null>(null);

  const importFile = async (file: File): Promise<Dataset | null> => {
    setError(null);
    try {
      const text = await file.text();
      const rows = file.name.toLowerCase().endsWith('.json') ? parseJsonRows(text) : await parseCsv(text);
      const dataset: Dataset = {
        id: crypto.randomUUID(),
        name: file.name.replace(/\.(csv|json)$/i, ''),
        description: '通过工作台导入的数据集',
        sourceFileName: file.name,
        importedAt: new Date().toISOString(),
        rowCount: rows.length,
        columnCount: Object.keys(rows[0] ?? {}).length,
        columns: buildColumns(rows),
        tags: ['imported'],
        data: rows,
      };
      return dataset;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '文件解析失败');
      return null;
    }
  };

  return { importFile, error };
};
