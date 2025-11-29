import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { reverseGeocodeSchema } from "./schemas";
import { formatLocationName } from "./utils";

const fetchReverseGeocode = async ({ queryKey }) => {
    const [_, lat, lon] = queryKey;
    const response = await axios.get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    return reverseGeocodeSchema.parse(response.data);
};

const useReverseGeocode = (location) => {
    const { data, isLoading, error } = useQuery({
        queryKey: [
            "reverseGeocode",
            location?.latitude,
            location?.longitude,
        ],
        queryFn: fetchReverseGeocode,
        enabled: !!location,
        staleTime: Infinity,
    });

    // Adapt BigDataCloud response to our formatLocationName expected object
    const addressObj = data
        ? {
            city: data.locality || data.city,
            state: data.principalSubdivision,
            country: data.countryName,
        }
        : null;

    const cityName = formatLocationName(addressObj);

    return { cityName, isLoading, error };
};

export default useReverseGeocode;
