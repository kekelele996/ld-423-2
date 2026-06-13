import Dexie, { Table } from 'dexie';
import { ChartConfig, Dataset, Filter, Report } from '../types';

class ResearchDataDb extends Dexie {
  datasets!: Table<Dataset, string>;
  charts!: Table<ChartConfig, string>;
  reports!: Table<Report, string>;
  filters!: Table<Filter, string>;

  constructor() {
    super('research-data-visualizer');
    this.version(1).stores({
      datasets: 'id, name, importedAt, *tags',
      charts: 'id, datasetId, name, type, *tags',
      reports: 'id, name, updatedAt, exportStatus',
      filters: 'id, datasetId, fieldName, active',
    });
  }
}

export const db = new ResearchDataDb();
