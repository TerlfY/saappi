import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { openMeteoSchema } from "./schemas";

const transformOpenMeteoData = (data) => {
  const hourly = data.hourly.time.map((time, index) => ({
    time: time,
    values: {
      temperature: data.hourly.temperature_2m[index],
      temperatureApparent: data.hourly.apparent_temperature[index],
      humidity: data.hourly.relativehumidity_2m[index],
      weatherCode: data.hourly.weathercode[index],
      windSpeed: data.hourly.windspeed_10m[index], // km/h by default, might need conversion if UI expects m/s
      windGusts: data.hourly.windgusts_10m ? data.hourly.windgusts_10m[index] : 0,
      windDirection: data.hourly.winddirection_10m ? data.hourly.winddirection_10m[index] : 0,
      uvIndex: data.hourly.uv_index[index],
      uvIndex: data.hourly.uv_index[index],
      cloudCover: data.hourly.cloudcover[index],
      snowDepth: data.hourly.snow_depth ? data.hourly.snow_depth[index] : 0,
      precipitationProbability: data.hourly.precipitation_probability ? data.hourly.precipitation_probability[index] : 0,
    },
  }));

  const daily = data.daily.time.map((time, index) => ({
    time: time,
    values: {
      temperatureMax: data.daily.temperature_2m_max[index],
      temperatureMin: data.daily.temperature_2m_min[index],
      weatherCode: data.daily.weathercode[index],
      sunriseTime: data.daily.sunrise[index],
      sunsetTime: data.daily.sunset[index],
      precipitationProbabilityMax: data.daily.precipitation_probability_max ? data.daily.precipitation_probability_max[index] : 0,
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

const fetchWeather = async ({ queryKey }) => {
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
      hourly: "temperature_2m,relativehumidity_2m,apparent_temperature,weathercode,windspeed_10m,windgusts_10m,winddirection_10m,uv_index,cloudcover,precipitation_probability",
      daily: "weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max",
      timezone: "auto",
      windspeed_unit: "ms",
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
    // ICON data should align by time since we use same timezone/location
    // But to be safe, we assume index alignment (Open-Meteo is consistent)
    if (snowResponse?.data?.hourly?.snow_depth) {
      // We inject it into the parsedData before transformation
      // Note: parsedData is Zod object, we might need to extend it or just modify the raw object if Zod allows
      // Actually, transformOpenMeteoData takes the raw data structure.
      // Let's just attach it.
      parsedData.hourly.snow_depth = snowResponse.data.hourly.snow_depth;
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
      status: null,
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
    } else if (err.request) {
      errorPayload = {
        message: "Network error. Please check your connection and try again.",
        status: null,
      };
    }
    throw errorPayload;
  }
};

const useWeatherData = (endpoint, params) => {
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
