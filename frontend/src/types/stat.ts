export interface StatSummary {
  datasetId: string;
  fieldName: string;
  mean: number;
  median: number;
  standardDeviation: number;
  min: number;
  max: number;
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
  };
  nullCount: number;
}
