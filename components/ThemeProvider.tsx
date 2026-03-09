'use client';

import { useEffect } from 'react';
import { useDiaryStore } from '@/store/diaryStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useDiaryStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(dark: boolean) {
      if (dark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    if (theme === 'dark') {
      applyTheme(true);
    } else if (theme === 'light') {
      applyTheme(false);
    } else {
      // system
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  return <>{children}</>;
}
