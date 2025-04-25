import { getIcon } from "./WeatherIcons";
import useWeatherData from "./useWeatherData"; // Or the correct path
import { Container, Spinner, Alert } from "react-bootstrap";
import "./CurrentWeather.css";
import { useMemo } from "react";

const CurrentWeather = ({ currentLocation, cityName }) => {
  const params = useMemo(
    () => ({
      // Memoize the params object
      location: currentLocation
        ? `${currentLocation.latitude},${currentLocation.longitude}`
        : null,
    }),
    [currentLocation]
  ); // Dependency: re-create only if currentLocation changes

  const {
    data: currentWeatherData,
    loading,
    error,
  } = useWeatherData("realtime", params);

  // --- Rendering Logic ---

  // Corrected console.log statement
  console.log(
    `--- CurrentWeather RENDER --- loading=${loading}, error=${JSON.stringify(
      error
    )}, hasData=${!!currentWeatherData?.data?.values}`
  );

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
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // 3. Handle No Data/Initial State (before location is known or fetch completes)
  // Check specifically for the expected data structure
  if (!currentWeatherData?.data?.values) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100%" }}
      >
        <p>Waiting for location or weather data...</p>
      </Container>
    );
    // Or return null, or a placeholder
  }

  return (
    <Container>
      <div>
        <h2 className="mt-3">{cityName}</h2>
        <img
          className="m-5"
          src={getIcon(currentWeatherData.data.values.weatherCode)}
        ></img>
        <p className="fs-4">{`${Math.round(
          currentWeatherData.data.values.temperature
        )}°C`}</p>
      </div>
    </Container>
  );
};

export default CurrentWeather;
