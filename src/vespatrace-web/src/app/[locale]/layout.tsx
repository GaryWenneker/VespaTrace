import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

// Define the supported locales
const locales = ['en', 'nl', 'fr', 'de'];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(params.locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../../messages/${params.locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider messages={messages} locale={params.locale}>
      {children}
    </NextIntlClientProvider>
  );
}

// This is required for next-intl
export const generateStaticParams = () => {
  return locales.map((locale) => ({ locale }));
};
