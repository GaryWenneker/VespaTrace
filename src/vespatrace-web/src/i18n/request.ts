import {getRequestConfig} from 'next-intl/server';

const locales = ['en', 'nl', 'fr', 'de'] as const;
type Locale = typeof locales[number];

export default getRequestConfig(async ({locale}) => {
  const l = (locale && (locales as readonly string[]).includes(locale)) ? (locale as Locale) : 'en';
  return {
    locale: l,
    messages: (await import(`../../messages/${l}.json`)).default
  };
});
