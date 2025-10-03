import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Link next-intl to src/i18n/request.ts (default lookup)
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true
};

export default withNextIntl(nextConfig);
