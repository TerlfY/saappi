import { WeatherData } from "./types";

interface LocationObj {
    name?: string;
    admin1?: string;
    country?: string;
}

export const formatLocationName = (locationObj: LocationObj | null): string => {
    if (!locationObj) return "";

    // Handle Open-Meteo format
    const name = locationObj.name;
    const admin1 = locationObj.admin1;
    const country = locationObj.country;

    // Filter out parts that are the same as the name to avoid "Berlin, Berlin, Germany"
    const parts = [name, admin1, country].filter((part): part is string => !!part && part !== name);

    // If admin1 was filtered out but it's different from country, we might want it.
    // But the above logic keeps admin1 if it's != name.
    // We also want to ensure we don't have duplicates in the list.
    // e.g. if name == admin1, we have [name, country].

    // Re-add name at the start if it was filtered (it shouldn't be by the logic above unless name is empty)
    if (name && parts[0] !== name) {
        parts.unshift(name);
    }

    // Remove duplicates just in case
    const uniqueParts = [...new Set(parts)];

    return uniqueParts.join(", ");
};

export const getCurrentHourData = (hourlyData: WeatherData[] | null, timezone: string): WeatherData | null => {
    if (!hourlyData || hourlyData.length === 0) return null;
    if (!timezone) return hourlyData[0]; // Fallback to first item

    try {
        // Use sv-SE for reliable ISO 8601 formatting (YYYY-MM-DD hh:mm:ss)
        const formatter = new Intl.DateTimeFormat('sv-SE', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            hour12: false
        });

        const parts = formatter.formatToParts(new Date());
        const year = parts.find(p => p.type === 'year')?.value;
        const month = parts.find(p => p.type === 'month')?.value;
        const day = parts.find(p => p.type === 'day')?.value;
        const hour = parts.find(p => p.type === 'hour')?.value;

        // Construct ISO-like string "YYYY-MM-DDTHH"
        const currentHourIso = `${year}-${month}-${day}T${hour}`;

        const index = hourlyData.findIndex(h => h.time.startsWith(currentHourIso));

        if (index !== -1) {
            return hourlyData[index];
        }

        // Fallback: find first future hour
        const nowIso = `${year}-${month}-${day}T${hour}:00`;
        const futureIndex = hourlyData.findIndex(h => h.time > nowIso);

        return futureIndex !== -1 ? hourlyData[futureIndex] : hourlyData[0];

    } catch (e) {
        console.error("Error finding current hour data:", e);
        return hourlyData[0];
    }
};
