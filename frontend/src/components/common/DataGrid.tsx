import { AgGridReact } from 'ag-grid-react';
import { ColDef, themeQuartz } from 'ag-grid-community';
import { ColumnDefinition, DatasetRow, DataType } from '../../types';
import 'ag-grid-community/styles/ag-grid.css';

interface DataGridProps {
  rows: DatasetRow[];
  columns: ColumnDefinition[];
  maxHeight?: number;
}

export const DataGrid = ({ rows, columns, maxHeight = 420 }: DataGridProps) => {
  const columnDefs: ColDef[] = columns.map((column) => ({
    field: column.name,
    sortable: true,
    filter: column.type === DataType.Number ? 'agNumberColumnFilter' : true,
    resizable: true,
  }));

  return (
    <div className="data-grid" style={{ height: maxHeight }}>
      <AgGridReact rowData={rows} columnDefs={columnDefs} theme={themeQuartz} pagination paginationPageSize={10} />
    </div>
  );
};
