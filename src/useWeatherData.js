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
    } catch (err) {
      console.error("API Fetch Error:", err);
      setError("Failed to fetch weather data. Please try again."); // Set user-friendly error
    } finally {
      setLoading(false);
    }
  }, [endpoint, params]); // Dependency array includes things that trigger refetch

  useEffect(() => {
    fetchData();
  }, [fetchData]); // useEffect depends on the memoized fetchData function

  return { data, loading, error };
};

export default useWeatherData;
