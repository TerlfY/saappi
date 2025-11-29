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
      uvIndex: data.hourly.uv_index[index],
      cloudCover: data.hourly.cloudcover[index],
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

  const options = {
    method: "GET",
    url: `https://api.open-meteo.com/v1/forecast`,
    params: {
      latitude: lat,
      longitude: lon,
      hourly: "temperature_2m,relativehumidity_2m,apparent_temperature,weathercode,windspeed_10m,uv_index,cloudcover",
      daily: "weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset",
      timezone: "auto",
      windspeed_unit: "ms", // Request m/s to match existing UI
    },
  };

  try {
    const response = await axios.request(options);

    // Validate response with Zod
    const parsedData = openMeteoSchema.parse(response.data);

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
