import { create } from 'zustand';
import { ThemeMode } from '../types';

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const initialMode = (localStorage.getItem('research-theme') as ThemeMode | null) ?? 'light';

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initialMode,
  toggleTheme: () => {
    const mode = get().mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('research-theme', mode);
    set({ mode });
  },
}));
