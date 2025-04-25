import { useState, useEffect } from "react";
import axios from "axios";
import { getIcon } from "./WeatherIcons";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./DailyForecast.css";
import { Container } from "react-bootstrap";

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
              apikey: import.meta.env.VITE_API_KEY,
            },
            headers: { accept: "application/json" },
          };
          // Fetch hourly weather data
          const weatherResponse = await axios.request(options);
          const dailyWeatherData = weatherResponse.data;

          const next4DaysData =
            dailyWeatherData?.timelines?.daily?.slice(1, 7) || [];

          setNext4DaysForecast(next4DaysData);
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Call the async function
    fetchData();
  }, [currentLocation]);

  return (
    <Container>
      {/* Mobile layout (visible on extra small and small devices) */}

      {next4DaysForecast.map((dayData, index) => (
        <Row id="daily-mobile" key={index} className="d-md-none my-2">
          <Col>
            <p className="fs-6 mx-4">{`${formatDay(
              new Date(dayData.time)
            )}`}</p>
          </Col>

          <Col>
            <img
              className="dailyIcons mx-4"
              src={getIcon(dayData.values.weatherCodeMin)}
              alt="Weather Icon"
            />
          </Col>

          <Col>
            <p className="fs-6 mx-4">{`${Math.round(
              dayData.values.temperatureMin
            )}...${Math.round(dayData.values.temperatureMax)}°C`}</p>
          </Col>
        </Row>
      ))}

      {/* Desktop layout (visible on medium devices and above) */}

      {next4DaysForecast.map((dayData, index) => (
        <Row key={index} className="d-flex my-3 d-none d-md-flex">
          <Col className="d-none d-md-flex">
            <p className="fs-5">{`${formatDay(new Date(dayData.time))}`}</p>
          </Col>

          <Col className="d-none d-md-flex">
            <img
              className="dailyIcons"
              src={getIcon(dayData.values.weatherCodeMin)}
              alt="Weather Icon"
            />
          </Col>

          <Col className="d-none d-md-flex">
            <p className="fs-5">{`${Math.round(
              dayData.values.temperatureMin
            )}...${Math.round(dayData.values.temperatureMax)}°C`}</p>
          </Col>
        </Row>
      ))}
    </Container>
  );
};

const formatDay = (date) => {
  const options = { weekday: "short" };
  return new Intl.DateTimeFormat("fi-FI", options).format(date);
};

export default DailyForecast;
