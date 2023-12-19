import { useState, useEffect } from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import { getIcon } from "./WeatherIcons";

const CurrentWeather = ({ currentLocation, cityName }) => {
  const [currentWeather, setCurrentWeather] = useState({});

  useEffect(() => {
    const fetchDataAndPost = async () => {
      try {
        // Fetch weather data when the current location is available
        if (currentLocation) {
          const options = {
            method: "GET",
            url: "https://api.tomorrow.io/v4/weather/realtime",
            params: {
              location: `${currentLocation.latitude},${currentLocation.longitude}`,
              apikey: "DNIV2e5FiakIKzzEeR8Zsrwy77PHA0eI",
            },
            headers: { accept: "application/json" },
          };

          // Fetch current weather data
          const weatherResponse = await axios.request(options);
          const currentWeatherData = weatherResponse.data;

          // Set state
          setCurrentWeather(currentWeatherData);

          // Fetch existing entries from the currentWeather database
          const existingEntriesResponse = await axios.get(
            "http://localhost:3001/currentWeather"
          );
          const existingEntries = existingEntriesResponse.data;

          // Iterate through existing entries and delete them one by one
          for (const entry of existingEntries) {
            await axios.delete(
              `http://localhost:3001/currentWeather/${entry.id}`
            );
          }

          // Post new weather data to the currentWeather database
          await axios.post(
            "http://localhost:3001/currentWeather",
            currentWeatherData
          );

          console.log("Weather data posted to JSON server");
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Call the async function
    fetchDataAndPost();
  }, [currentLocation]);

  return (
    <Container>
      {Object.keys(currentWeather).length > 0 && (
        <div>
          <h2 className="mt-3">{cityName}</h2>
          <img
            className="m-5"
            src={getIcon(currentWeather.data.values.weatherCode)}
          ></img>
          <p className="fs-4">{`${Math.round(
            currentWeather.data.values.temperature
          )}°C`}</p>
        </div>
      )}
    </Container>
  );
};

export default CurrentWeather;
