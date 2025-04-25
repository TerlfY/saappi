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
      let specificErrorMsg = "An unexpected error occurred. Please try again."; // Default message

      if (axios.isAxiosError(err) && err.response) {
        // Check if it's an Axios error and the server responded
        const status = err.response.status;
        if (status === 429) {
          // Specific message for rate limiting
          specificErrorMsg =
            "API rate limit exceeded. Please wait before trying again.";
        } else {
          // Other server errors (4xx, 5xx)
          specificErrorMsg = `Error: ${status} - ${err.response.statusText}. Please try again.`;
        }
      } else if (err.request) {
        // The request was made but no response was received (e.g., network error)
        specificErrorMsg =
          "Network error. Please check your connection and try again.";
      }
      // No need for specific logs before setError anymore
      setError(specificErrorMsg); // Set the determined error message
      // --- End Specific Error Handling ---
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
