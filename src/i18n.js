import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationVI from './locales/vi/translation.json';

const resources = {
  en: { translation: translationEN },
  vi: { translation: translationVI }
};

i18n
  .use(LanguageDetector) // Tự động phát hiện ngôn ngữ trình duyệt
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi', // Ngôn ngữ mặc định nếu không tìm thấy
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;