'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Shield } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import Dashboard from '../../components/Dashboard';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('HomePage');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <header className="relative z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="h-10 w-10 text-orange-500" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  {t('title')}
                </h1>
                <p className="text-xs text-gray-400">Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <div className="hidden md:flex items-center space-x-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">System Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="py-8">
        <Dashboard />
      </main>
      <footer className="border-t border-gray-800 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          <p>&copy; 2025 {t('title')}. Powered by .NET 9</p>
        </div>
      </footer>
    </div>
  );
}