import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'nl', 'fr', 'de'] as const;
type Locale = typeof locales[number];

export default getRequestConfig(async ({locale}) => {
  const loc = locale ?? 'en';
  const active: Locale = (locales as readonly string[]).includes(loc) ? (loc as Locale) : 'en';
  return {
    locale: active,
    messages: (await import(`../messages/${active}.json`)).default
  };
});
