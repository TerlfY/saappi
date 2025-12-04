import { translations } from "./translations";

export const getWeatherDescription = (code: number, language: string = 'en'): string => {
    const langData = translations[language] || translations['en'];
    return langData.weather[code] || langData.weather.unknown;
};
