"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Locale = "en" | "nl"; // Extend as you add more JSON files
type Messages = Record<string, string>;

type I18nContextValue = {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

async function loadMessages(locale: Locale): Promise<Messages> {
  try {
    switch (locale) {
      case "nl":
        return (await import("@/messages/nl.json")).default as Messages;
      case "en":
      default:
        return (await import("@/messages/en.json")).default as Messages;
    }
  } catch {
    return {};
  }
}

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [locale, _setLocale] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("locale") as Locale | null;
      if (stored === "en" || stored === "nl") return stored;
    }
    return "en";
  });
  const [messages, setMessages] = useState<Messages>({});

  useEffect(() => {
    let cancelled = false;
    loadMessages(locale).then((m) => {
      if (!cancelled) setMessages(m);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    _setLocale(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("locale", l);
    }
  }, []);

  const t = useCallback(
    (key: string, fallback = "") => {
      return (messages && key in messages ? messages[key] : undefined) ?? fallback ?? key;
    },
    [messages]
  );

  const value = useMemo<I18nContextValue>(() => ({ locale, messages, setLocale, t }), [locale, messages, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within MessagesProvider");
  return ctx;
}
