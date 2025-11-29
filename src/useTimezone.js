import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchTimezone = async ({ queryKey }) => {
    const [_, lat, lon] = queryKey;
    // We only need the timezone field from the response header or body, 
    // but Open-Meteo returns it in the body if we ask for a simple forecast.
    // Using 'timezone=auto' resolves the timezone for the coordinates.
    const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto&daily=weathercode&forecast_days=1`
    );
    return response.data.timezone;
};

const useTimezone = (location) => {
    const { data: timezone, isLoading, error } = useQuery({
        queryKey: ["timezone", location?.latitude, location?.longitude],
        queryFn: fetchTimezone,
        enabled: !!location?.latitude && !!location?.longitude,
        staleTime: Infinity, // Timezone for a location doesn't change often
    });

    return { timezone, isLoading, error };
};

export default useTimezone;
