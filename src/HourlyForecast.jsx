import { useState, useEffect } from "react";
import axios from "axios";
import { getIcon } from "./WeatherIcons";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./HourlyForecast.css";
import { Container } from "react-bootstrap";

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
              apikey: import.meta.env.VITE_API_KEY,
            },
            headers: { accept: "application/json" },
          };

          // Fetch hourly weather data
          const weatherResponse = await axios.request(options);
          const hourlyWeatherData = weatherResponse.data;
          const next4HoursData =
            hourlyWeatherData?.timelines?.hourly?.slice(1, 6) || [];

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
    <Container>
      {/* Mobile layout (visible on extra small and small devices) */}
      <Row id="hourly-mobile" className="d-md-none my-2">
        {next4HoursForecast.map((hourData, index) => (
          <Col
            key={index}
            className="border border-secondary border-bottom-0 border-top-0"
          >
            <Col>
              <p className="fs-6 m-0">{`${new Date(
                hourData.time
              ).getHours()}`}</p>
              <img
                className="hourlyIcons my-1"
                src={getIcon(hourData.values.weatherCode)}
                alt="Weather Icon"
              />
              <p className="fs-6 my-1">{`${Math.round(
                hourData.values.temperature
              )}°C`}</p>
            </Col>
          </Col>
        ))}
      </Row>

      {/* Desktop layout (visible on medium devices and above) */}
      {next4HoursForecast.map((hourData, index) => (
        <Row key={index} className="d-flex d-none d-md-flex">
          <Col md={4} className="d-none d-md-flex">
            <p className="fs-5 m-3">{`${new Date(
              hourData.time
            ).getHours()}`}</p>
          </Col>

          <Col md={4} className="d-none d-md-flex">
            <img
              className="hourlyIcons m-2"
              src={getIcon(hourData.values.weatherCode)}
              alt="Weather Icon"
            />
          </Col>

          <Col md={2} className="d-none d-md-flex">
            <p className="fs-5 m-3">{`${Math.round(
              hourData.values.temperature
            )}°C`}</p>
          </Col>
        </Row>
      ))}
    </Container>
  );
};

export default HourlyForecast;
