import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Location } from "./types";

const fetchReverseGeocode = async ({ queryKey }: { queryKey: [string, number | undefined, number | undefined] }) => {
    const [_, lat, lon] = queryKey;
    if (lat === undefined || lon === undefined) return null;

    try {
        // Use native fetch to avoid Axios default headers that might trigger CORS preflights.
        // We cannot set User-Agent in browser anyway (it is a forbidden header),
        // so we use the 'email' param for Nominatim's usage policy.
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fi&email=saappiapp@example.com`
        );

        if (!response.ok) {
            throw new Error(`Reverse geocode HTTP error: ${response.status}`);
        }

        const data = await response.json();
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
