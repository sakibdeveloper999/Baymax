import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en.json';
import bnTranslations from './bn.json';
import arTranslations from './ar.json';

const resources = {
    en: { translation: enTranslations },
    bn: { translation: bnTranslations },
    ar: { translation: arTranslations },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('language') || 'en',
        fallbackLng: 'en',
        debug: false, // Suppress i18next logger warnings
        interpolation: {
            escapeValue: false,
        },
    });

// Save language preference
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('language', lng);
});

export default i18n;
