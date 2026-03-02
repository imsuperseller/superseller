'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchLocale(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-medium uppercase">{locale}</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 py-1 min-w-[140px] bg-[#1a2a3e] border border-white/10 rounded-xl shadow-xl z-50">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                l === locale
                  ? 'text-[var(--superseller-primary)] bg-white/5'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {localeNames[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
