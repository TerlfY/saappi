import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { reverseGeocodeSchema } from "./schemas";
import { formatLocationName } from "./utils";
import { Location } from "./types";

const fetchReverseGeocode = async ({ queryKey }: { queryKey: [string, number | undefined, number | undefined] }) => {
    const [_, lat, lon] = queryKey;
    if (lat === undefined || lon === undefined) return null;
    const response = await axios.get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    return reverseGeocodeSchema.parse(response.data);
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
    });

    // Adapt BigDataCloud response to Open-Meteo format for formatLocationName
    const locationObj = data
        ? {
            name: data.locality || data.city,
            admin1: data.principalSubdivision,
            country: data.countryName,
        }
        : null;

    const cityName = formatLocationName(locationObj);

    return { cityName, isLoading, error };
};

export default useReverseGeocode;
