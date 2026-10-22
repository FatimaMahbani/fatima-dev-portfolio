export const LOCALES = {
  ar: {
    lang: "ar",
    dir: "rtl",
  },
  en: {
    lang: "en",
    dir: "ltr",
  },
};

export const DEFAULT_LOCALE = "ar";

const STORAGE_KEY = "fatima-portfolio:locale";

export function applyLocale(locale) {
  const next = LOCALES[locale] ?? LOCALES[DEFAULT_LOCALE];
  const root = document.documentElement;

  root.lang = next.lang;
  root.dir = next.dir;
  root.dataset.locale = locale in LOCALES ? locale : DEFAULT_LOCALE;
}

// Reads the visitor's previously chosen language. Falls back to Arabic
// whenever nothing is stored yet, the stored value is unrecognized, or
// localStorage is unavailable (private browsing, disabled storage, etc.).
export function getStoredLocale() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored in LOCALES ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function storeLocale(locale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale in LOCALES ? locale : DEFAULT_LOCALE);
  } catch {
    // Storage unavailable — the toggle still works for the current session.
  }
}
