import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import idTranslations from './locales/id.json';
import jaTranslations from './locales/ja.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      id: {
        translation: idTranslations,
      },
      ja: {
        translation: jaTranslations,
      }
    },
    fallbackLng: 'id',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;