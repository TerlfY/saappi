import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { openMeteoSchema, OpenMeteoResponse } from "./schemas";
import { WeatherData, DailyForecast } from "./types";

interface TransformedData {
    timelines: {
        hourly: WeatherData[];
        daily: DailyForecast[];
    };
    timezone: string;
}

const transformOpenMeteoData = (data: OpenMeteoResponse): TransformedData => {
    const hourly = data.hourly.time.map((time, index) => ({
        time: time,
        values: {
            temperature: data.hourly.temperature_2m[index] ?? 0,
            temperatureApparent: data.hourly.apparent_temperature[index] ?? 0,
            humidity: data.hourly.relativehumidity_2m[index] ?? 0,
            weatherCode: data.hourly.weathercode[index] ?? 0,
            windSpeed: data.hourly.windspeed_10m[index] ?? 0, // km/h by default, might need conversion if UI expects m/s
            windGusts: data.hourly.windgusts_10m ? data.hourly.windgusts_10m[index] ?? 0 : 0,
            windDirection: data.hourly.winddirection_10m ? data.hourly.winddirection_10m[index] ?? 0 : 0,
            uvIndex: data.hourly.uv_index[index] ?? 0,

            cloudCover: data.hourly.cloudcover[index] ?? 0,
            snowDepth: data.hourly.snow_depth ? data.hourly.snow_depth[index] ?? 0 : 0,
            snowfall: data.hourly.snowfall ? data.hourly.snowfall[index] ?? 0 : 0,
            precipitationProbability: data.hourly.precipitation_probability ? data.hourly.precipitation_probability[index] ?? 0 : 0,
            precipitation: data.hourly.precipitation ? data.hourly.precipitation[index] ?? 0 : 0, // Added precipitation
            isDay: data.hourly.is_day ? data.hourly.is_day[index] ?? 1 : 1, // Default to 1 (day) if missing
        },
    }));

    const daily = data.daily.time.map((time, index) => ({
        time: time,
        values: {
            temperatureMax: data.daily.temperature_2m_max[index] ?? 0,
            temperatureMin: data.daily.temperature_2m_min[index] ?? 0,
            weatherCode: data.daily.weathercode[index] ?? 0,
            sunriseTime: data.daily.sunrise[index],
            sunsetTime: data.daily.sunset[index],
            precipitationProbabilityMax: data.daily.precipitation_probability_max ? data.daily.precipitation_probability_max[index] ?? 0 : 0,
            precipitationSum: data.daily.precipitation_sum ? data.daily.precipitation_sum[index] ?? 0 : 0,
            snowfallSum: data.daily.snowfall_sum ? data.daily.snowfall_sum[index] ?? 0 : 0,
            // Added missing required fields from DailyForecast interface with default values
            temperatureAvg: 0, // Not provided by OpenMeteo directly in this call
            precipitationProbabilityAvg: 0, // Not provided
            weatherCodeMax: data.daily.weathercode[index] ?? 0, // Using weathercode as max for now
            moonPhase: 0, // Not provided
        },
    }));

    return {
        timelines: {
            hourly,
            daily,
        },
        timezone: data.timezone,
    };
};

interface WeatherParams {
    location?: string;
}

const fetchWeather = async ({ queryKey }: { queryKey: [string, string, WeatherParams] }): Promise<TransformedData | null> => {
    const [_, endpoint, params] = queryKey;

    if (!params?.location) {
        return null;
    }

    // Parse location "lat,lon" string
    const [lat, lon] = params.location.split(",");

    // 1. Main Weather Request (Best Match / Auto)
    const mainOptions = {
        method: "GET",
        url: `https://api.open-meteo.com/v1/forecast`,
        params: {
            latitude: lat,
            longitude: lon,
            hourly: "temperature_2m,relativehumidity_2m,apparent_temperature,weathercode,windspeed_10m,windgusts_10m,winddirection_10m,uv_index,cloudcover,precipitation_probability,precipitation,snowfall,is_day",
            daily: "weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,precipitation_sum,snowfall_sum",
            timezone: "auto",
            windspeed_unit: "ms",
            forecast_days: 16,
        },
    };

    // 2. Snow Depth Request (ICON Model - often more accurate for snow)
    const snowOptions = {
        method: "GET",
        url: `https://api.open-meteo.com/v1/forecast`,
        params: {
            latitude: lat,
            longitude: lon,
            hourly: "snow_depth",
            models: "icon_seamless", // Explicitly use ICON for snow
            timezone: "auto",
            forecast_days: 16,
        },
    };

    try {
        // Run requests in parallel
        const [mainResponse, snowResponse] = await Promise.all([
            axios.request(mainOptions),
            axios.request(snowOptions).catch(e => {
                console.warn("Snow depth fetch failed, falling back to main:", e);
                return { data: { hourly: { snow_depth: [] } } }; // Fallback empty
            })
        ]);

        // Validate main response
        const parsedData = openMeteoSchema.parse(mainResponse.data);

        // Merge snow depth from ICON into main data
        if (snowResponse?.data?.hourly?.snow_depth) {
            // We need to be careful here as parsedData is typed.
            // We can cast it or just mutate it if we are sure.
            // Since snow_depth is optional in schema, we can assign it.
            if (parsedData.hourly) {
                parsedData.hourly.snow_depth = snowResponse.data.hourly.snow_depth;
            }
        }

        console.log(
            `✅ SUCCESS fetching weather for location:`,
            params?.location
        );

        // Transform to match existing app structure
        return transformOpenMeteoData(parsedData);

    } catch (err) {
        console.error("API Fetch Error:", err);

        let errorPayload = {
            message: "An unexpected error occurred.",
            status: null as number | null | string,
        };

        if (err instanceof z.ZodError) {
            errorPayload = {
                message: "Data validation failed. API response format changed.",
                status: "VALIDATION_ERROR",
            };
            console.error("Zod Validation Errors:", err.errors);
        } else if (axios.isAxiosError(err) && err.response) {
            const status = err.response.status;
            errorPayload = {
                message: `Error: ${status} - ${err.response.statusText}. Please try again.`,
                status: status,
            };
        } else if ((err as any).request) {
            errorPayload = {
                message: "Network error. Please check your connection and try again.",
                status: null,
            };
        }
        throw errorPayload;
    }
};

const useWeatherData = (endpoint: string, params: WeatherParams) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["weather", endpoint, params],
        queryFn: fetchWeather,
        enabled: !!params?.location, // Only run if location is provided
        staleTime: 1000 * 60 * 15, // Cache for 15 minutes
        retry: 1, // Retry once on failure
        refetchOnWindowFocus: false, // Don't refetch on window focus to save API calls
    });

    return { data, loading: isLoading, error };
};

export default useWeatherData;
