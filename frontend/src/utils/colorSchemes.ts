import { ColorScheme } from '../types';
import { colorPalettes } from '../constants/colorPalettes';

export const getPalette = (scheme: ColorScheme) => colorPalettes[scheme] ?? colorPalettes.Default;
