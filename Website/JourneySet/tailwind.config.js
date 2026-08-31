/** @type {import('tailwindcss').Config} */

/**
 * Accent colour ramps are driven by CSS variables (see src/index.css).
 * `indigo`  → the primary accent (--accent-*)
 * `violet`  → the gradient partner accent (--accent2-*)
 * Swapping the `data-theme` attribute on <html> re-points every one of the
 * ~80 hardcoded `indigo-*` / `violet-*` classes without touching a component.
 */
const ramp = (name) => {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  return Object.fromEntries(
    shades.map((s) => [s, `rgb(var(--${name}-${s}) / <alpha-value>)`])
  );
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgb(var(--accent-600) / 0.07)',
        'card-hover': '0 8px 28px rgb(var(--accent-600) / 0.13)',
      },
      colors: {
        indigo: ramp('accent'),
        violet: ramp('accent2'),
        /* Text / icon colour that sits on top of an accent-filled surface.
           White for every theme except Gold, where it is near-black. */
        'on-accent': 'rgb(var(--accent-contrast) / <alpha-value>)',
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      minHeight: {
        dvh: '100dvh',
      },
      height: {
        dvh: '100dvh',
      },
    },
  },
  plugins: [],
};
