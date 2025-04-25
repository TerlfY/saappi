import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useWeatherData = (endpoint, params) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!params?.location) {
      // Don't fetch if location is missing
      setData(null); // Clear data if location becomes null
      return;
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
      console.log(
        `✅ SUCCESS fetching ${endpoint} for location:`,
        params?.location
      ); // Log success
    } catch (err) {
      // --- Enhanced Logging ---
      console.error("💥 API Fetch Error Object:", err); // Keep this
      console.log("!!! ENTERING CATCH BLOCK !!!"); // Highlight entry

      let specificErrorMsg = "An unexpected error occurred. Please try again."; // Default message

      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        console.log(`Error is AxiosError with response. Status: ${status}`); // Log status
        if (status === 429) {
          specificErrorMsg =
            "API rate limit exceeded. Please wait before trying again.";
          console.log("Setting RATE LIMIT error message"); // Log intention
        } else {
          specificErrorMsg = `Error: ${status} - ${err.response.statusText}. Please try again.`;
          console.log("Setting OTHER server error message"); // Log intention
        }
      } else if (err.request) {
        specificErrorMsg =
          "Network error. Please check your connection and try again.";
        console.log("Setting NETWORK error message"); // Log intention
      } else {
        console.log("Setting UNEXPECTED error message (not Axios/Network)"); // Log intention
      }
      setError(specificErrorMsg); // Set the determined error message
      // --- End Enhanced Logging ---
    } finally {
      console.log("!!! ENTERING FINALLY BLOCK - Setting loading to false !!!"); // Highlight entry and action
      setLoading(false);
    }
  }, [endpoint, params]);

  useEffect(() => {
    // Optional: Add log to see when effect triggers
    console.log(
      `Effect triggered for ${endpoint}, location: ${params?.location}. Calling fetchData.`
    );
    fetchData();
  }, [fetchData]); // Dependency on memoized fetchData is correct

  return { data, loading, error };
};

export default useWeatherData;
