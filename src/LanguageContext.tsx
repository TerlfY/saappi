import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { translations } from './translations';

interface LanguageContextType {
    language: string;
    setLanguage: React.Dispatch<React.SetStateAction<string>>;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<string>(() => {
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

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                // Fallback to English if missing
                let fallback: any = translations['en'];
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
        return value as string;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'fi' : 'en');
    };

    const contextValue = React.useMemo(() => ({
        language,
        setLanguage,
        toggleLanguage,
        t
    }), [language]);

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
