import {useState, useEffect} from 'react';

export interface ChartTheme {
  gold: string;
  naGreen: string;
  red: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  chartGrid: string;
}

function readTheme(): ChartTheme {
  const s = getComputedStyle(document.documentElement);
  return {
    gold: s.getPropertyValue('--color-gold').trim(),
    naGreen: s.getPropertyValue('--color-na-green-light').trim(),
    red: s.getPropertyValue('--color-red').trim(),
    text: s.getPropertyValue('--color-text').trim(),
    textSecondary: s.getPropertyValue('--color-text-secondary').trim(),
    textMuted: s.getPropertyValue('--color-text-muted').trim(),
    surface: s.getPropertyValue('--color-surface').trim(),
    surfaceAlt: s.getPropertyValue('--color-surface-alt').trim(),
    border: s.getPropertyValue('--color-border').trim(),
    chartGrid: s.getPropertyValue('--color-chart-grid').trim(),
  };
}

const DEFAULT_THEME: ChartTheme = {
  gold: '#F2B827',
  naGreen: '#4B916D',
  red: '#E74C3C',
  text: '#e8e4de',
  textSecondary: '#888888',
  textMuted: '#555555',
  surface: '#222222',
  surfaceAlt: '#2a2518',
  border: '#333333',
  chartGrid: '#2A2A2A',
};

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(DEFAULT_THEME);

  useEffect(() => {
    setTheme(readTheme());

    const observer = new MutationObserver(() => {
      setTheme(readTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}
