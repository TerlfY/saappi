export const formatLocationName = (addressObj) => {
    if (!addressObj) return "";

    const city =
        addressObj.city ||
        addressObj.town ||
        addressObj.village ||
        addressObj.hamlet ||
        addressObj.municipality ||
        addressObj.locality;

    const region = addressObj.state || addressObj.principalSubdivision || addressObj.county;
    const country = addressObj.country || addressObj.countryName;

    const parts = [city, region, country].filter(Boolean);

    // Remove duplicates (e.g. if city and region are the same)
    const uniqueParts = [...new Set(parts)];

    return uniqueParts.join(", ");
};
