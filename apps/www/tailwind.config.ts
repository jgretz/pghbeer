import type {Config} from 'tailwindcss';

export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Oswald', 'sans-serif'],
      },
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        gold: 'var(--color-gold)',
        'gold-dark': 'var(--color-gold-dark)',
        'gold-light': 'var(--color-gold-light)',
        'gold-bg': 'var(--color-gold-bg)',
        'na-green': 'var(--color-na-green)',
        'na-green-light': 'var(--color-na-green-light)',
        'na-green-bg': 'var(--color-na-green-bg)',
        'tried-bg': 'var(--color-tried-bg)',
        'check-fg': 'var(--color-check-fg)',
        shadow: 'var(--color-shadow)',
        overlay: 'var(--color-overlay)',
        'progress-track': 'var(--color-progress-track)',
      },
    },
  },
} satisfies Config;
