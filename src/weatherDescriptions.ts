import { translations } from "./translations";

export const getWeatherDescription = (code: number | null | undefined, language: string = 'en'): string => {
    const langData = translations[language] || translations['en'];
    if (code === null || code === undefined) {
        return langData.weather.unknown;
    }
    return langData.weather[code] || langData.weather.unknown;
};
