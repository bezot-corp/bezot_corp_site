export const locales = ['fr-fr', 'en-us'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr-fr';

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}
