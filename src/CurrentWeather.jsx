import Container from "react-bootstrap/Container";
import { getIcon } from "./WeatherIcons";
import useWeatherData from "./useWeatherData"; // Or the correct path

const CurrentWeather = ({ currentLocation, cityName }) => {
  const {
    data: currentWeatherData,
    loading,
    error,
  } = useWeatherData(
    "realtime", // Endpoint string
    {
      // Params object
      location: currentLocation
        ? `${currentLocation.latitude},${currentLocation.longitude}`
        : null, // Pass null if location isn't ready
    }
  );

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
