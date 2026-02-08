import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Location, Webcam } from "./types";

const API_KEY = import.meta.env.VITE_WINDY_API_KEY;

interface WebcamQueryKey {
    lat?: number;
    lon?: number;
    radius: number;
}

const fetchWebcams = async ({ queryKey }: { queryKey: [string, WebcamQueryKey] }): Promise<Webcam[] | null> => {
    const [_, { lat, lon, radius }] = queryKey;

    if (!lat || !lon || !API_KEY) return null;

    try {
        // Windy Webcams API v3
        // Endpoint: https://api.windy.com/webcams/api/v3/webcams
        const response = await axios.get(
            `https://api.windy.com/webcams/api/v3/webcams`,
            {
                params: {
                    limit: 10,
                    nearby: `${lat},${lon},${radius}`,
                    include: "images,location",
                },
                headers: {
                    "X-WINDY-API-KEY": API_KEY,
                },
            }
        );

        if (response.data && response.data.webcams && response.data.webcams.length > 0) {
            // Sort by viewCount descending to get the most popular ones
            const sortedWebcams = response.data.webcams.sort((a: Webcam, b: Webcam) => (b.viewCount || 0) - (a.viewCount || 0));
            // Return top 5
            return sortedWebcams.slice(0, 5);
        }
        return [];
    } catch (error) {
        console.error("Error fetching webcams:", error);
        throw error;
    }
};

const useWebcams = (location: Location | null) => {
    const lat = location?.latitude;
    const lon = location?.longitude;
    // Default radius 20km
    const radius = 20;

    return useQuery({
        queryKey: ["webcams", { lat, lon, radius }],
        queryFn: fetchWebcams,
        enabled: !!lat && !!lon && !!API_KEY,
        staleTime: 1000 * 60 * 10, // 10 minutes (API images expire)
        retry: 1,
    });
};

export default useWebcams;
