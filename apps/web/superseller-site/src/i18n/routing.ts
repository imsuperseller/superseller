import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'he', 'fa', 'cs', 'hu', 'hi', 'ko'] as const;
export type Locale = (typeof locales)[number];

export const rtlLocales = new Set<Locale>(['he', 'fa']);

export const localeNames: Record<Locale, string> = {
  en: 'English',
  he: 'עברית',
  fa: 'فارسی',
  cs: 'Čeština',
  hu: 'Magyar',
  hi: 'हिन्दी',
  ko: '한국어',
};

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed', // No /en/ prefix for default locale
});
