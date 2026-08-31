export type ThemeName = 'light' | 'dark' | 'sky' | 'gold' | 'forest';

export interface ThemeMeta {
  id: ThemeName;
  label: string;
  /** whether this theme uses the dark base (page background / surfaces) */
  dark: boolean;
  /** representative accent colour for swatches */
  swatch: string;
}

/**
 * The five fixed themes. `data-theme` on <html> selects the accent ramp
 * (see src/index.css); `dark` here drives the `.dark` class for the base.
 */
export const THEMES: ThemeMeta[] = [
  { id: 'light', label: 'Light', dark: false, swatch: '#4f46e5' },
  { id: 'dark', label: 'Dark', dark: true, swatch: '#818cf8' },
  { id: 'sky', label: 'Sky', dark: false, swatch: '#0284c7' },
  { id: 'gold', label: 'Gold', dark: false, swatch: '#d97706' },
  { id: 'forest', label: 'Forest', dark: true, swatch: '#059669' },
];

export const isThemeName = (v: string): v is ThemeName =>
  THEMES.some(t => t.id === v);
