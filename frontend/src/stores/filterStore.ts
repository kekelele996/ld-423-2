import { create } from 'zustand';
import { Filter, FilterOperator } from '../types';
import { sampleFilter } from '../api/mockData';

interface FilterState {
  filters: Filter[];
  addFilter: (datasetId: string, fieldName: string) => void;
  updateFilter: (filter: Filter) => void;
  removeFilter: (filterId: string) => void;
  toggleFilter: (filterId: string) => void;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  filters: [sampleFilter],
  addFilter: (datasetId, fieldName) =>
    set({
      filters: [
        ...get().filters,
        { id: crypto.randomUUID(), datasetId, fieldName, operator: FilterOperator.Equals, value: '', active: true },
      ],
    }),
  updateFilter: (filter) => set({ filters: get().filters.map((candidate) => (candidate.id === filter.id ? filter : candidate)) }),
  removeFilter: (filterId) => set({ filters: get().filters.filter((filter) => filter.id !== filterId) }),
  toggleFilter: (filterId) => set({ filters: get().filters.map((filter) => (filter.id === filterId ? { ...filter, active: !filter.active } : filter)) }),
}));
