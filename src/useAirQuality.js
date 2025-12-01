import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchAirQuality = async ({ queryKey }) => {
    const [_, location] = queryKey;
    if (!location) return null;

    const { latitude, longitude } = location;

    const response = await axios.get(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,us_aqi&timezone=auto`
    );

    return response.data;
};

const useAirQuality = (location) => {
    return useQuery({
        queryKey: ["airQuality", location],
        queryFn: fetchAirQuality,
        enabled: !!location,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
};

export default useAirQuality;
