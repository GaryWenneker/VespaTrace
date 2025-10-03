import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

// Define the supported locales
const locales = ['en', 'nl', 'fr', 'de'];

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children, params } = props;
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}

// This is required for next-intl
export const generateStaticParams = () => {
  return locales.map((locale) => ({ locale }));
};
