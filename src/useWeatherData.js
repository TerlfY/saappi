import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { weatherResponseSchema } from "./schemas";

const fetchWeather = async ({ queryKey }) => {
  const [_, endpoint, params] = queryKey;

  if (!params?.location) {
    return null;
  }

  const options = {
    method: "GET",
    url: `https://api.tomorrow.io/v4/weather/${endpoint}`,
    params: {
      ...params,
      apikey: import.meta.env.VITE_API_KEY,
    },
    headers: { accept: "application/json" },
  };

  try {
    const response = await axios.request(options);

    // Validate response with Zod
    const parsedData = weatherResponseSchema.parse(response.data);

    console.log(
      `✅ SUCCESS fetching ${endpoint} for location:`,
      params?.location
    );
    return parsedData;
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
      if (status === 429) {
        errorPayload = {
          message:
            "API rate limit exceeded. Please try again at next full hour.",
          status: 429,
        };
      } else {
        errorPayload = {
          message: `Error: ${status} - ${err.response.statusText}. Please try again.`,
          status: status,
        };
      }
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
