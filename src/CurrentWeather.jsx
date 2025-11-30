import { Container, Spinner, Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import "./CurrentWeather.css";
import { getWeatherDescription } from "./weatherDescriptions";
import SkeletonWeather from "./SkeletonWeather";
import { getIcon } from "./WeatherIcons";

const CurrentWeather = ({ weatherData, dailyValues, loading, error, cityName, timezone }) => {
  // --- Rendering Logic ---

  // 1. Handle Loading State
  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100%" }}
      >
        <SkeletonWeather type="current" />
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
  if (dailyValues?.sunriseTime && dailyValues?.sunsetTime && timezone) {
    try {
      // Get current time in the target timezone as "YYYY-MM-DD, HH:MM:SS"
      // and convert to "YYYY-MM-DDTHH:MM:SS" to match Open-Meteo format
      const localTimeStr = new Date().toLocaleString("en-CA", {
        timeZone: timezone,
        hour12: false
      }).replace(", ", "T");

      // Direct string comparison works because formats are consistent (ISO-like)
      isDay = localTimeStr >= dailyValues.sunriseTime && localTimeStr < dailyValues.sunsetTime;
    } catch (e) {
      console.error("Error calculating isDay:", e);
      // Fallback to local hour check if timezone conversion fails
      const hour = new Date().getHours();
      isDay = hour >= 6 && hour < 22;
    }
  } else {
    // Fallback if no sunrise/sunset data
    const hour = new Date().getHours();
    isDay = hour >= 6 && hour < 22;
  }

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {getWeatherDescription(weatherData.values.weatherCode)}
    </Tooltip>
  );

  return (
    <Container>
      <div>
        <h2 className="mt-3 text-truncate" style={{ maxWidth: "100%" }} title={cityName}>
          {cityName}
        </h2>
        <OverlayTrigger
          placement="bottom"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip}
        >
          <img
            className="mb-3 current-weather-icon"
            style={{ height: "120px", width: "auto", objectFit: "contain" }}
            src={getIcon(
              weatherData.values.weatherCode,
              isDay,
              weatherData.values.cloudCover
            )}
            alt="Weather Icon"
          />
        </OverlayTrigger>
        <p className="fs-1 fw-bold">{`${Math.round(
          weatherData.values.temperature
        )}°C`}</p>

        {/* Weather Details Grid */}
        <div className="weather-details-grid mt-4">
          <div className="detail-item">
            <span className="detail-label">Feels Like</span>
            <span className="detail-value">{Math.round(weatherData.values.temperatureApparent)}°C</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Wind</span>
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="wind-tooltip">
                  Gusts: {Math.round(weatherData.values.windGusts)} m/s
                </Tooltip>
              }
            >
              <span className="detail-value" style={{ cursor: "help", textDecoration: "underline dotted" }}>
                {Math.round(weatherData.values.windSpeed)} m/s
              </span>
            </OverlayTrigger>
          </div>
          <div className="detail-item">
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{Math.round(weatherData.values.humidity)}%</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">UV Index</span>
            <span className="detail-value">{weatherData.values.uvIndex}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Sunrise</span>
            <span className="detail-value">
              {dailyValues?.sunriseTime
                ? dailyValues.sunriseTime.split("T")[1]
                : "--:--"}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Sunset</span>
            <span className="detail-value">
              {dailyValues?.sunsetTime
                ? dailyValues.sunsetTime.split("T")[1]
                : "--:--"}
            </span>
          </div>
          <div className="detail-item" style={{ gridColumn: "span 2" }}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="detail-label">Snow Depth</span>
              <span className="detail-value">{weatherData.values.snowDepth ? (weatherData.values.snowDepth * 100).toFixed(0) : 0} cm</span>
            </div>
            <div style={{ height: "8px", background: "rgba(255,255,255,0.2)", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(((weatherData.values.snowDepth || 0) * 100) / 50 * 100, 100)}%`,
                  background: "#fff",
                  borderRadius: "4px",
                  transition: "width 0.5s ease-out"
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CurrentWeather;
