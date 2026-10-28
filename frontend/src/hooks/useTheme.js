import { useEffect, useState } from 'react';

const THEME_KEY = 'job-tracker:theme';

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  return [theme, toggleTheme];
}
