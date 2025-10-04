'use client';

import { Activity, AlertTriangle, ArrowRight, BarChart3, Bug, CheckCircle, Eye, Globe, MapPin, Menu, Shield, Smartphone, TrendingUp, Users, X, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const t = useTranslations();
  const locale = useLocale();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Accessibility: trap focus and close on Escape when mobile menu is open
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    // Focus close button initially
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex="0"]'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (active === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  if (!mounted) {
    return null; // Avoid hydration issues
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-x-hidden">
      {/* Header */}
      <header className="relative z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <Link href={`/${locale}`} className="flex items-center space-x-3" aria-label="Go to home">
              <div className="relative">
                <Shield className="h-10 w-10 text-orange-500" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  {t('app.title')}
                </h1>
                <p className="text-xs text-gray-400">{t('app.subtitle')}</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">{t('system.active')}</span>
              </div>
              <button className="hidden md:inline-flex bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-medium transition-colors">
                {t('button.dashboard')}
              </button>
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
              {/* Mobile hamburger */}
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => {
                  setMenuVisible(true);
                  // Allow initial render before toggling transform to trigger transition
                  requestAnimationFrame(() => setMobileOpen(true));
                }}
                className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl border border-gray-700/60 bg-gray-800/60 hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <div className="relative">
                  {/* Vespa-styled hamburger: bars with accent and a small bug icon */}
                  <Menu className="h-6 w-6 text-gray-200" />
                  <Bug className="h-3 w-3 text-orange-500 absolute -top-1 -right-1" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-over menu */}
      {menuVisible && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="mobile-menu"
            ref={panelRef}
            className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-gray-900 border-l border-gray-700 shadow-2xl transform transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
            onTransitionEnd={(e) => {
              if (e.target === e.currentTarget && !mobileOpen) {
                setMenuVisible(false);
              }
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-orange-500" />
                <span className="font-semibold">{t('app.title')}</span>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                ref={closeBtnRef}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-700 bg-gray-800/60 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <X className="h-5 w-5 text-gray-200" />
              </button>
            </div>

            <nav className="px-5 py-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/${locale}`}
                    className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-800/70 border border-transparent hover:border-gray-700 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-orange-400" />
                      <span className="text-gray-200">{t('nav.home', { default: 'Home' })}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                  </Link>
                </li>
                <li>
                  <Link
                    href={`#features`}
                    className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-800/70 border border-transparent hover:border-gray-700 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-200">{t('nav.features', { default: 'Features' })}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                  </Link>
                </li>
                <li>
                  <Link
                    href={`#risk`}
                    className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-800/70 border border-transparent hover:border-gray-700 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <span className="text-gray-200">{t('nav.risk', { default: 'Risk' })}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}`}
                    className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-800/70 border border-transparent hover:border-gray-700 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-green-400" />
                      <span className="text-gray-200">{t('button.dashboard')}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                  </Link>
                </li>
                <li>
                  <button
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-800/70 border border-transparent hover:border-gray-700 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Eye className="h-5 w-5 text-purple-400" />
                      <span className="text-gray-200">{t('cta.watchDemo')}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                  </button>
                </li>
              </ul>

              <div className="mt-6 space-y-3">
                <div className="text-xs uppercase tracking-wider text-gray-500 px-1">
                  {t('menu.language', { default: 'Language' })}
                </div>
                <div className="px-1">
                  <LanguageSwitcher />
                </div>
                <div className="flex items-center space-x-2 bg-green-500/10 text-green-400 px-3 py-2 rounded-lg border border-green-500/20 w-max">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">{t('system.active')}</span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
  <section id="hero" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-orange-500/10 text-orange-400 px-4 py-2 rounded-full border border-orange-500/20 mb-6">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">{t('hero.poweredBy')}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              {t('hero.title')}
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                {t('hero.subtitle')}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('hero.description')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-orange-500/25 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>{t('cta.viewLive')}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="border border-gray-600 hover:border-gray-500 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800/50 transition-all duration-200 flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>{t('cta.watchDemo')}</span>
            </button>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Activity, label: t('stats.activeMonitors'), value: '1,247', color: 'text-blue-400' },
              { icon: AlertTriangle, label: t('stats.alertsToday'), value: '23', color: 'text-yellow-400' },
              { icon: CheckCircle, label: t('stats.verifiedSightings'), value: '89', color: 'text-green-400' },
              { icon: Shield, label: t('stats.protectedAreas'), value: '156', color: 'text-purple-400' },
            ].map((stat, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-700/50 transition-colors">
                <stat.icon className={`h-8 w-8 ${stat.color} mb-3 mx-auto`} />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
  <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t('section.comprehensive')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('section.comprehensiveSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: t('features.web.title'),
                description: t('features.web.description'),
                features: [t('features.web.features.0'), t('features.web.features.1'), t('features.web.features.2'), t('features.web.features.3')],
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Smartphone,
                title: t('features.mobile.title'),
                description: t('features.mobile.description'),
                features: [t('features.mobile.features.0'), t('features.mobile.features.1'), t('features.mobile.features.2'), t('features.mobile.features.3')],
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: BarChart3,
                title: t('features.backend.title'),
                description: t('features.backend.description'),
                features: [t('features.backend.features.0'), t('features.backend.features.1'), t('features.backend.features.2'), t('features.backend.features.3')],
                color: 'from-orange-500 to-red-500'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:bg-gray-700/30 transition-all duration-300 hover:-translate-y-1">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Assessment Section */}
  <section id="risk" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full border border-red-500/20 mb-6">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{t('risk.badge')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {t('risk.title')}
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                {t('risk.description')}
              </p>
              <div className="space-y-4">
                {[
                  { icon: Activity, text: t('risk.list.0') },
                  { icon: MapPin, text: t('risk.list.1') },
                  { icon: Users, text: t('risk.list.2') },
                  { icon: TrendingUp, text: t('risk.list.3') }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="bg-orange-500/10 p-2 rounded-lg">
                      <item.icon className="h-5 w-5 text-orange-400" />
                    </div>
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">{t('risk.panel.currentRisk')}</h3>
                  <div className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/20">
                    <span className="text-sm font-medium">{t('risk.level.medium')}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t('risk.species.asianGiant')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="w-3/5 h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                      </div>
                      <span className="text-white font-medium">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t('risk.species.european')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="w-1/4 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-white font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t('risk.species.other')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="w-1/6 h-full bg-gradient-to-r from-gray-500 to-gray-600 rounded-full"></div>
                      </div>
                      <span className="text-white font-medium">15%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{t('risk.lastUpdated.label')}</span>
                    <span className="text-white">{t('risk.lastUpdated.time')}</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-500/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-red-500/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link href={`/${locale}`} className="flex items-center space-x-3 mb-4 md:mb-0" aria-label="Go to home">
              <Shield className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="text-lg font-bold text-white">{t('app.title')}</h3>
                <p className="text-sm text-gray-400">{t('footer.tagline')}</p>
              </div>
            </Link>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>{t('footer.poweredDotnet')}</span>
              <span>•</span>
              <span>{t('footer.ml')}</span>
              <span>•</span>
              <span>{t('footer.next')}</span>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
