export const locales = ['it', 'en', 'ro', 'es', 'fr', 'de'] as const;
export type Locale = (typeof locales)[number];

/** Used when the visitor's browser languages match none of `locales`. */
export const defaultLocale: Locale = 'en';

/** Cookie holding the visitor's manual choice (or the first detection). */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const localeNames: Record<Locale, string> = {
  it: 'Italiano',
  en: 'English',
  ro: 'Română',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && (locales as readonly string[]).includes(value)
  );
}

/**
 * Picks the best supported locale from an Accept-Language header
 * (e.g. "it-IT,it;q=0.9,en;q=0.8"). Exact tags win over base-language
 * matches at equal quality; returns `defaultLocale` when nothing matches.
 */
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) {
    return defaultLocale;
  }

  const ranked = acceptLanguage
    .split(',')
    .map((part, index) => {
      const [tag = '', ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return {
        tag: tag.toLowerCase(),
        q: Number.isNaN(q) ? 0 : q,
        index,
      };
    })
    .filter((entry) => entry.tag && entry.tag !== '*' && entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const { tag } of ranked) {
    const base = tag.split('-')[0];
    if (isLocale(base)) {
      return base;
    }
  }

  return defaultLocale;
}

/** English language names, used to tell AI generations which language to write in. */
export const localeEnglishNames: Record<Locale, string> = {
  it: 'Italian',
  en: 'English',
  ro: 'Romanian',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
};
