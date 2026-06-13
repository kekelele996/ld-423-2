import { create } from 'zustand';
import { ChartConfig } from '../types';
import { sampleChart } from '../api/mockData';
import { db } from '../utils/db';

interface ChartState {
  charts: ChartConfig[];
  selectedChartId: string;
  loadCharts: () => Promise<void>;
  saveChart: (chart: ChartConfig) => Promise<void>;
  selectChart: (chartId: string) => void;
  removeChart: (chartId: string) => Promise<void>;
}

export const useChartStore = create<ChartState>((set, get) => ({
  charts: [sampleChart],
  selectedChartId: sampleChart.id,
  loadCharts: async () => {
    const persisted = await db.charts.toArray();
    if (persisted.length === 0) {
      await db.charts.put(sampleChart);
      return;
    }
    set({ charts: persisted, selectedChartId: persisted[0].id });
  },
  saveChart: async (chart) => {
    await db.charts.put(chart);
    const existing = get().charts.some((candidate) => candidate.id === chart.id);
    set({ charts: existing ? get().charts.map((candidate) => (candidate.id === chart.id ? chart : candidate)) : [chart, ...get().charts], selectedChartId: chart.id });
  },
  selectChart: (chartId) => set({ selectedChartId: chartId }),
  removeChart: async (chartId) => {
    await db.charts.delete(chartId);
    set({ charts: get().charts.filter((chart) => chart.id !== chartId), selectedChartId: chartId });
  },
}));
