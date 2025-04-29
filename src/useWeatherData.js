import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useWeatherData = (endpoint, params) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    // Check if location parameter is valid before proceeding
    if (!params?.location) {
      setData(null); // Clear data if location becomes null or invalid
      setLoading(false); // Ensure loading is false if we don't fetch
      setError(null); // Clear any previous error
      return; // Stop execution if location is missing
    }

    setLoading(true);
    setError(null);
    setData(null); // Clear previous data on new fetch

    const options = {
      method: "GET",
      url: `https://api.tomorrow.io/v4/weather/${endpoint}`,
      params: {
        ...params, // Include location, timesteps etc. passed in
        apikey: import.meta.env.VITE_API_KEY,
      },
      headers: { accept: "application/json" },
    };

    try {
      const response = await axios.request(options);
      setData(response.data);
      // Optional: Keep this log if you find it useful to see successful fetches
      console.log(
        `✅ SUCCESS fetching ${endpoint} for location:`,
        params?.location
      );
    } catch (err) {
      console.error("API Fetch Error:", err); // Keep logging the actual error object

      // --- Start Specific Error Handling ---
      // --- FIX: Define payload object ---
      let errorPayload = {
        message: "An unexpected error occurred.",
        status: null,
      };

      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        if (status === 429) {
          // --- FIX: Assign specific object for 429 ---
          errorPayload = {
            message:
              "API rate limit exceeded. Please try again at next full hour.",
            status: 429,
          };
        } else {
          // --- FIX: Assign object for other statuses ---
          errorPayload = {
            message: `Error: ${status} - ${err.response.statusText}. Please try again.`,
            status: status,
          };
        }
      } else if (err.request) {
        // --- FIX: Assign object for network error ---
        errorPayload = {
          message: "Network error. Please check your connection and try again.",
          status: null, // Or a specific code/flag for network errors if needed
        };
      }
      // No need for specific logs before setError anymore

      // --- FIX: Set the error state to the payload object ---
      setError(errorPayload);
    } finally {
      // No need for the finally log anymore
      setLoading(false);
    }
  }, [endpoint, params]); // Dependency array

  useEffect(() => {
    // No need for the effect trigger log anymore
    fetchData();
  }, [fetchData]); // Dependency on memoized fetchData is correct

  return { data, loading, error };
};

export default useWeatherData;
