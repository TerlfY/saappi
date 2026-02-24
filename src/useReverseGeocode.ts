import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Location } from "./types";

const fetchReverseGeocode = async ({ queryKey }: { queryKey: [string, number | undefined, number | undefined] }) => {
    const [_, lat, lon] = queryKey;
    if (lat === undefined || lon === undefined) return null;

    // Use Open-Meteo geocoding API (reverse via nearest city search)
    // Open-Meteo doesn't have a direct reverse geocode, so we use a coordinate-based
    // search with the Nominatim-compatible endpoint
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fi`,
            { headers: { "User-Agent": "Saappi-Weather-App" } }
        );

        const data = response.data;
        if (data?.address) {
            const name = data.address.city || data.address.town || data.address.village || data.address.municipality || data.address.county || "";
            return { name, country: data.address.country || "" };
        }
        return null;
    } catch (err) {
        console.warn("Reverse geocode failed:", err);
        return null;
    }
};

const useReverseGeocode = (location: Location | null) => {
    const { data, isLoading, error } = useQuery({
        queryKey: [
            "reverseGeocode",
            location?.latitude,
            location?.longitude,
        ] as [string, number | undefined, number | undefined],
        queryFn: fetchReverseGeocode,
        enabled: !!location,
        staleTime: Infinity,
        retry: 1,
    });

    const cityName = data?.name
        ? (data.country ? `${data.name}, ${data.country}` : data.name)
        : "";

    return { cityName, isLoading, error };
};

export default useReverseGeocode;
