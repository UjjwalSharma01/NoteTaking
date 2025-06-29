'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeDebug() {
  const { theme, isDark, mounted } = useTheme();
  
  if (process.env.NODE_ENV === 'production') return null;
  
  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-2 rounded text-xs z-50">
      Theme: {theme} | Dark: {isDark ? 'true' : 'false'} | Mounted: {mounted ? 'true' : 'false'}
      <br />
      HTML classes: {typeof document !== 'undefined' ? document.documentElement.className : 'SSR'}
    </div>
  );
}
