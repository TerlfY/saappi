import { translations } from "./translations";

export const getWeatherDescription = (code, language = 'en') => {
    const langData = translations[language] || translations['en'];
    return langData.weather[code] || langData.weather.unknown;
};
