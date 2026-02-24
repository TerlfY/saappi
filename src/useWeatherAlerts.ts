import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Location } from "./types";

export interface WeatherAlert {
    id: string;
    severity: "Minor" | "Moderate" | "Severe" | "Extreme" | "Unknown";
    event: string;
    headline: string;
    description: string;
    onset: string;
    expires: string;
}

/**
 * Fetches weather alerts/warnings from Open-Meteo's weather API.
 * Open-Meteo doesn't have a direct alerts endpoint, so we use the
 * FMI open data WFS service for Finnish locations.
 */
const fetchAlerts = async (location: Location | null): Promise<WeatherAlert[]> => {
    if (!location) return [];

    try {
        // Use FMI WFS for weather warnings (Finland-specific)
        const wfsUrl = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::forecast::edited::weather::scandinavia::point::simple&place=&latlon=${location.latitude},${location.longitude}&parameters=Temperature&timestep=60&`;

        // Try FMI weather warnings
        const fmiWarningsUrl = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::observations::weather::cities::multipointcoverage`;

        // For now, use a more reliable approach: Open-Meteo's weather interpretation
        // and generate alerts based on extreme conditions from the forecast data
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
            params: {
                latitude: location.latitude,
                longitude: location.longitude,
                hourly: "temperature_2m,windgusts_10m,precipitation,snowfall,weathercode",
                forecast_days: 2,
                timezone: "auto",
                windspeed_unit: "ms",
            }
        });

        const data = response.data;
        const alerts: WeatherAlert[] = [];
        const now = new Date();

        if (!data?.hourly?.time) return [];

        // Scan next 48h for extreme conditions
        for (let i = 0; i < data.hourly.time.length; i++) {
            const time = new Date(data.hourly.time[i]);
            if (time < now) continue;

            const temp = data.hourly.temperature_2m[i];
            const gusts = data.hourly.windgusts_10m?.[i] || 0;
            const precip = data.hourly.precipitation?.[i] || 0;
            const snowfall = data.hourly.snowfall?.[i] || 0;
            const weatherCode = data.hourly.weathercode?.[i] || 0;

            // Extreme cold
            if (temp !== null && temp <= -25 && !alerts.some(a => a.event === "extreme_cold")) {
                alerts.push({
                    id: `cold-${i}`,
                    severity: temp <= -30 ? "Severe" : "Moderate",
                    event: "extreme_cold",
                    headline: "",  // Will be translated in component
                    description: "",
                    onset: data.hourly.time[i],
                    expires: data.hourly.time[Math.min(i + 6, data.hourly.time.length - 1)],
                });
            }

            // Strong wind gusts
            if (gusts >= 20 && !alerts.some(a => a.event === "strong_wind")) {
                alerts.push({
                    id: `wind-${i}`,
                    severity: gusts >= 25 ? "Severe" : "Moderate",
                    event: "strong_wind",
                    headline: "",
                    description: "",
                    onset: data.hourly.time[i],
                    expires: data.hourly.time[Math.min(i + 6, data.hourly.time.length - 1)],
                });
            }

            // Heavy precipitation
            if (precip >= 10 && !alerts.some(a => a.event === "heavy_rain")) {
                alerts.push({
                    id: `rain-${i}`,
                    severity: precip >= 20 ? "Severe" : "Moderate",
                    event: "heavy_rain",
                    headline: "",
                    description: "",
                    onset: data.hourly.time[i],
                    expires: data.hourly.time[Math.min(i + 6, data.hourly.time.length - 1)],
                });
            }

            // Heavy snowfall
            if (snowfall >= 5 && !alerts.some(a => a.event === "heavy_snow")) {
                alerts.push({
                    id: `snow-${i}`,
                    severity: snowfall >= 10 ? "Severe" : "Moderate",
                    event: "heavy_snow",
                    headline: "",
                    description: "",
                    onset: data.hourly.time[i],
                    expires: data.hourly.time[Math.min(i + 6, data.hourly.time.length - 1)],
                });
            }

            // Thunderstorm
            if (weatherCode >= 95 && !alerts.some(a => a.event === "thunderstorm")) {
                alerts.push({
                    id: `storm-${i}`,
                    severity: weatherCode >= 96 ? "Severe" : "Moderate",
                    event: "thunderstorm",
                    headline: "",
                    description: "",
                    onset: data.hourly.time[i],
                    expires: data.hourly.time[Math.min(i + 3, data.hourly.time.length - 1)],
                });
            }
        }

        return alerts;
    } catch (err) {
        console.warn("Weather alerts fetch failed:", err);
        return [];
    }
};

const useWeatherAlerts = (location: Location | null) => {
    const { data: alerts = [], isLoading, error } = useQuery({
        queryKey: ["weatherAlerts", location?.latitude, location?.longitude],
        queryFn: () => fetchAlerts(location),
        enabled: !!location,
        staleTime: 1000 * 60 * 30, // Cache for 30 minutes
        retry: 1,
        refetchOnWindowFocus: false,
    });

    return { alerts, loading: isLoading, error };
};

export default useWeatherAlerts;
