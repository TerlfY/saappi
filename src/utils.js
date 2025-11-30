export const formatLocationName = (addressObj) => {
    if (!addressObj) return "";

    const city =
        addressObj.city ||
        addressObj.town ||
        addressObj.village ||
        addressObj.hamlet ||
        addressObj.municipality ||
        addressObj.suburb ||
        addressObj.neighbourhood ||
        addressObj.county ||
        addressObj.province ||
        addressObj.locality;

    const country = addressObj.country || addressObj.countryName;

    // Only include city and country to keep it short and prevent layout breakage
    const parts = [city, country].filter(Boolean);

    // Remove duplicates
    const uniqueParts = [...new Set(parts)];

    return uniqueParts.join(", ");
};

export const getCurrentHourData = (hourlyData, timezone) => {
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
        const year = parts.find(p => p.type === 'year').value;
        const month = parts.find(p => p.type === 'month').value;
        const day = parts.find(p => p.type === 'day').value;
        const hour = parts.find(p => p.type === 'hour').value;

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
