import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        try {
            const stored = localStorage.getItem('weatherApp_language');
            return stored || 'en';
        } catch (e) {
            return 'en';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('weatherApp_language', language);
        } catch (e) {
            console.error("Error saving language:", e);
        }
    }, [language]);

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                // Fallback to English if missing
                let fallback = translations['en'];
                for (const fk of keys) {
                    if (fallback && fallback[fk]) {
                        fallback = fallback[fk];
                    } else {
                        return key; // Return key if not found anywhere
                    }
                }
                return fallback;
            }
        }
        return value;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'fi' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
