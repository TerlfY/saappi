import { useState, useEffect } from "react";
import axios from "axios";
import { getIcon } from "./WeatherIcons";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./DailyForecast.css";

const DailyForecast = ({ currentLocation }) => {
  const [next4DaysForecast, setNext4DaysForecast] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentLocation) {
          const options = {
            method: "GET",
            url: "https://api.tomorrow.io/v4/weather/forecast",
            params: {
              location: `${currentLocation.latitude},${currentLocation.longitude}`,
              timesteps: "1d",
              apikey: "DNIV2e5FiakIKzzEeR8Zsrwy77PHA0eI",
            },
            headers: { accept: "application/json" },
          };
          // Fetch hourly weather data
          const weatherResponse = await axios.request(options);
          const dailyWeatherData = weatherResponse.data;

          const next4DaysData =
            dailyWeatherData?.timelines?.daily?.slice(1, 5) || [];

          setNext4DaysForecast(next4DaysData);

          // const existingEntries = existingEntriesResponse.data;

          console.log("Weather data posted to JSON server");

          // Fetch existing entries from the hourlyWeather database
          const existingEntriesResponse = await axios.get(
            "http://localhost:3001/dailyWeather"
          );

          const existingEntries = existingEntriesResponse.data;

          // Iterate through existing entries and delete them one by one
          for (const entry of existingEntries) {
            await axios.delete(
              `http://localhost:3001/dailyWeather/${entry.id}`
            );
          }
          // Post new weather data to the hourlyWeather database
          await axios.post(
            "http://localhost:3001/dailyWeather",
            dailyWeatherData
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Call the async function
    fetchData();
  }, [currentLocation]);

  return (
    <div>
      {next4DaysForecast.map((dayData, index) => (
        <Row key={index} className="d-flex">
          <Col>
            <p className="fs-5 m-3">{`${formatDay(new Date(dayData.time))}`}</p>
          </Col>

          <Col>
            <img
              className="dailyIcons m-3"
              src={getIcon(dayData.values.weatherCodeMin)}
              alt="Weather Icon"
            />
          </Col>

          <Col>
            <p className="fs-5 m-3">{`${Math.round(
              dayData.values.temperatureMin
            )}...${Math.round(dayData.values.temperatureMax)}°C`}</p>
          </Col>
        </Row>
      ))}
    </div>
  );
};

const formatDay = (date) => {
  const options = { weekday: "short" };
  return new Intl.DateTimeFormat("fi-FI", options).format(date);
};

export default DailyForecast;
