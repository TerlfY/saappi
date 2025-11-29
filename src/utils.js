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
