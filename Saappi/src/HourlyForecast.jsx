import { useState, useEffect } from "react";
import axios from "axios";
import { getIcon } from "./WeatherIcons";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const HourlyForecast = ({ currentLocation }) => {
  const [next4HoursForecast, setNext4HoursForecast] = useState([]);

  useEffect(() => {
    const fetchDataAndPost = async () => {
      try {
        // Fetch weather data when the current location is available
        if (currentLocation) {
          const options = {
            method: "GET",
            url: "https://api.tomorrow.io/v4/weather/forecast",
            params: {
              location: `${currentLocation.latitude},${currentLocation.longitude}`,
              timesteps: "1h",
              apikey: "DNIV2e5FiakIKzzEeR8Zsrwy77PHA0eI",
            },
            headers: { accept: "application/json" },
          };

          // Fetch hourly weather data
          const weatherResponse = await axios.request(options);
          const hourlyWeatherData = weatherResponse.data;
          const next4HoursData =
            hourlyWeatherData?.timelines?.hourly?.slice(1, 5) || [];

          setNext4HoursForecast(next4HoursData);

          // Fetch existing entries from the hourlyWeather database
          const existingEntriesResponse = await axios.get(
            "http://localhost:3001/hourlyWeather"
          );
          const existingEntries = existingEntriesResponse.data;
          // Iterate through existing entries and delete them one by one

          for (const entry of existingEntries) {
            await axios.delete(
              `http://localhost:3001/hourlyWeather/${entry.id}`
            );
          }

          // Post new weather data to the hourlyWeather database
          await axios.post(
            "http://localhost:3001/hourlyWeather",
            hourlyWeatherData
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
    <div>
      <p>Hourly Forecast</p>
      {next4HoursForecast.map((hourData, index) => (
        <Col key={index}>
          <p>{`${new Date(hourData.time).getHours()}`}</p>
          <img src={getIcon(hourData.values.weatherCode)} alt="Weather Icon" />
          <p>{`${Math.round(hourData.values.temperature)}°C`}</p>
        </Col>
      ))}
    </div>
  );
};

export default HourlyForecast;
