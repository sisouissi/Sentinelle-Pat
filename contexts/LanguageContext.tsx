import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { translations as frTranslations } from '../locales/fr';
import { translations as enTranslations } from '../locales/en';
import { translations as arTranslations } from '../locales/ar';

type Language = 'fr' | 'en' | 'ar';
type Translations = typeof frTranslations;

// FIX: Define a utility type to generate all possible dot-notation paths from the translations object.
// This creates a union of strings like "app.loading", "header.title", etc., which provides
// type safety and autocompletion for the `t` function.
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;
type DotNestedKeys<T> = (T extends object ?
    { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
    : "") extends infer D ? Extract<D, string> : never;
    
type TranslationKey = DotNestedKeys<Translations>;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Translations;
  t: (key: TranslationKey, options?: { [key: string]: string | number }) => string;
}

const translationsMap = {
  fr: frTranslations,
  en: enTranslations,
  ar: arTranslations,
};

// Helper function for nested key access
const getNestedTranslation = (obj: any, key: string): string | undefined => {
    return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check for saved language or browser preference, default to 'fr'
    const savedLang = localStorage.getItem('sentinelle_language');
    if (savedLang === 'fr' || savedLang === 'en' || savedLang === 'ar') {
      return savedLang;
    }
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'en') return 'en';
    if (browserLang === 'ar') return 'ar';
    return 'fr';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('sentinelle_language', lang);
    setLanguageState(lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);
  
  const currentTranslations = useMemo(() => translationsMap[language], [language]);

  const t = useCallback((key: TranslationKey, options?: { [key: string]: string | number }) => {
    let translation = getNestedTranslation(currentTranslations, key) || key;
    
    if (options) {
      Object.keys(options).forEach(optionKey => {
        translation = translation.replace(`{{${optionKey}}}`, String(options[optionKey]));
      });
    }

    return translation;
  }, [currentTranslations]);


  const value = {
    language,
    setLanguage,
    translations: currentTranslations,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};