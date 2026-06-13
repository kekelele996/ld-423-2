import { FilterOperator } from './enums';

export interface Filter {
  id: string;
  datasetId: string;
  fieldName: string;
  operator: FilterOperator;
  value: string | number | boolean | Array<string | number>;
  active: boolean;
}
