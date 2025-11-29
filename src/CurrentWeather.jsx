import { getIcon } from "./WeatherIcons";
import { Container, Spinner, Alert } from "react-bootstrap";
import "./CurrentWeather.css";

const CurrentWeather = ({ weatherData, dailyValues, loading, error, cityName, timezone }) => {
  // --- Rendering Logic ---

  // 1. Handle Loading State
  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100%" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // 2. Handle Error State
  if (error) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100%" }}
      >
        <Alert variant="danger">
          {error.message || "Error fetching weather data."}
        </Alert>
      </Container>
    );
  }

  // 3. Handle No Data/Initial State
  if (!weatherData?.values) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100%" }}
      >
        <p>Waiting for weather data...</p>
      </Container>
    );
  }

  // Calculate isDay
  let isDay = true;
  if (dailyValues?.sunriseTime && dailyValues?.sunsetTime) {
    const now = new Date();
    const sunrise = new Date(dailyValues.sunriseTime);
    const sunset = new Date(dailyValues.sunsetTime);
    isDay = now >= sunrise && now < sunset;
  } else {
    // Fallback if no sunrise/sunset data
    let hour = new Date().getHours();
    if (timezone) {
      try {
        const hourString = new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          hour12: false,
          timeZone: timezone,
        });
        hour = parseInt(hourString, 10);
      } catch (e) {
        console.warn("Invalid timezone:", timezone);
      }
    }
    isDay = hour >= 6 && hour < 22;
  }

  return (
    <Container>
      <div>
        <h2 className="mt-3">{cityName}</h2>
        <img
          className="m-5"
          src={getIcon(
            weatherData.values.weatherCode,
            isDay,
            weatherData.values.cloudCover
          )}
          alt="Weather Icon"
        ></img>
        <p className="fs-4">{`${Math.round(
          weatherData.values.temperature
        )}°C`}</p>
      </div>
    </Container>
  );
};

export default CurrentWeather;
