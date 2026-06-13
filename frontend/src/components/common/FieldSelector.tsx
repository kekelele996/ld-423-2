import { ColumnDefinition } from '../../types';

interface FieldSelectorProps {
  label: string;
  value: string;
  columns: ColumnDefinition[];
  numericOnly?: boolean;
  onChange: (value: string) => void;
}

export const FieldSelector = ({ label, value, columns, numericOnly, onChange }: FieldSelectorProps) => {
  const options = numericOnly ? columns.filter((column) => column.type === 'Number') : columns;
  return (
    <label className="field-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">请选择字段</option>
        {options.map((column) => (
          <option key={column.name} value={column.name}>
            {column.name} · {column.type}
          </option>
        ))}
      </select>
    </label>
  );
};
