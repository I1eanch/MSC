export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './borders';

import { colors, semanticColors } from './colors';
import { typography, fontSizes, fontWeights, lineHeights, letterSpacing, fontFamilies } from './typography';
import { spacing, spacingPx } from './spacing';
import { shadows, elevation } from './shadows';
import { borderRadius, borderRadiusPx, borderWidth, borderWidthPx } from './borders';

export const theme = {
  colors,
  semanticColors,
  typography,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  fontFamilies,
  spacing,
  spacingPx,
  shadows,
  elevation,
  borderRadius,
  borderRadiusPx,
  borderWidth,
  borderWidthPx,
};

export type Theme = typeof theme;

export default theme;
