import { ColorScheme } from '../types';

export const colorPalettes: Record<ColorScheme, string[]> = {
  [ColorScheme.Default]: ['#315a7d', '#d65f35', '#6c8e5a', '#a57b36', '#7f6aa8'],
  [ColorScheme.Pastel]: ['#8fb7c9', '#e5a68b', '#b8cc8f', '#d8c47f', '#c3a6d6'],
  [ColorScheme.Vivid]: ['#0f766e', '#be123c', '#ca8a04', '#2563eb', '#7c3aed'],
  [ColorScheme.Monochrome]: ['#1f2937', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'],
  [ColorScheme.Scientific]: ['#005f73', '#0a9396', '#94d2bd', '#ee9b00', '#ca6702'],
};
