'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useMessages } from 'next-intl';

export default function LocaleLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = useMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}