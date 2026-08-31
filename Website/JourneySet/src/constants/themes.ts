export type ThemeName = 'light' | 'dark' | 'sky' | 'gold' | 'forest';

export interface ThemeMeta {
  id: ThemeName;
  label: string;
  /** whether this theme uses the dark base (page background / surfaces) */
  dark: boolean;
  /** base surface colour, for the swatch preview */
  base: string;
  /** accent colour, for the swatch preview */
  swatch: string;
}

/**
 * The five fixed themes. `data-theme` on <html> selects the accent ramp
 * (see src/index.css); `dark` here drives the `.dark` class for the base.
 *
 * Swatches are drawn as a split circle (base half + accent half) so Light
 * and Dark — which share the indigo accent — stay visually distinct.
 */
export const THEMES: ThemeMeta[] = [
  { id: 'light', label: 'Light', dark: false, base: '#ffffff', swatch: '#4f46e5' },
  { id: 'dark', label: 'Dark', dark: true, base: '#0f172a', swatch: '#4f46e5' },
  { id: 'sky', label: 'Sky', dark: false, base: '#ffffff', swatch: '#0284c7' },
  { id: 'gold', label: 'Gold', dark: false, base: '#ffffff', swatch: '#eab308' },
  { id: 'forest', label: 'Forest', dark: true, base: '#0f172a', swatch: '#059669' },
];

export const isThemeName = (v: string): v is ThemeName =>
  THEMES.some(t => t.id === v);
