import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { LOCALE_COOKIE, isLocale, matchLocale } from './config';

/**
 * Locale resolution without URL prefixes (profile slugs own the root path
 * namespace, so `/it/...` would collide with a user called "it"):
 * 1. the `NEXT_LOCALE` cookie (manual choice from the language switcher, or
 *    the first detection written by `src/proxy.ts`);
 * 2. otherwise the browser's Accept-Language header;
 * 3. otherwise English.
 */
export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : matchLocale((await headers()).get('accept-language'));

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
