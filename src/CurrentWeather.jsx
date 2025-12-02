import { Container, Spinner, Alert, OverlayTrigger, Tooltip, Button, ProgressBar } from "react-bootstrap";
import "./CurrentWeather.css";
import { getWeatherDescription } from "./weatherDescriptions";
import SkeletonWeather from "./SkeletonWeather";
import { getIcon } from "./WeatherIcons";
import useAirQuality from "./useAirQuality";
import SunDial from "./SunDial";

const CurrentWeather = ({ weatherData, dailyValues, loading, error, cityName, timezone, darkMode, toggleDarkMode, onLocationReset, isFavorite, onToggleFavorite, location }) => {
  const { data: aqiData, isLoading: aqiLoading } = useAirQuality(location);
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

  // Use isDay from API data
  const isDay = weatherData.values.isDay;

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {getWeatherDescription(weatherData.values.weatherCode)}
    </Tooltip>
  );

  return (
    <Container className="position-relative">
      <div className="weather-controls">
        <Button
          variant="link"
          onClick={onLocationReset}
          className="control-btn"
          title="Use Current Location"
        >
          📍
        </Button>
        <Button
          variant="link"
          onClick={toggleDarkMode}
          className="control-btn"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? "☀️" : "🌙"}
        </Button>
      </div>

      <div>
        <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
          <h2 className="text-truncate m-0" style={{ maxWidth: "80%" }} title={cityName}>
            {cityName}
          </h2>
          <Button
            variant="link"
            onClick={onToggleFavorite}
            className="p-0 text-decoration-none"
            style={{ fontSize: "1.5rem", lineHeight: 1, color: isFavorite ? "#FFD700" : (darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)") }}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            {isFavorite ? "★" : "☆"}
          </Button>
        </div>
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
          <div className="detail-item" style={{ gridColumn: "span 2", padding: "10px 0" }}>
            <SunDial
              sunrise={dailyValues?.sunriseTime}
              sunset={dailyValues?.sunsetTime}
              timezone={timezone}
              isDay={isDay}
            />
          </div>

          {/* Air Quality Meter */}
          {aqiData?.current && (
            <div className="detail-item" style={{ gridColumn: "span 2" }}>
              {(() => {
                const aqi = aqiData.current.european_aqi;
                let status = "Good";
                let color = "success";
                if (aqi > 20) { status = "Fair"; color = "info"; }
                if (aqi > 40) { status = "Moderate"; color = "warning"; }
                if (aqi > 60) { status = "Poor"; color = "danger"; }
                if (aqi > 80) { status = "Very Poor"; color = "danger"; }
                if (aqi > 100) { status = "Extremely Poor"; color = "dark"; }

                // Invert percentage: 0 AQI (Good) = 100% Bar, 100 AQI (Bad) = 0% Bar
                const percentage = Math.max(0, 100 - aqi);

                return (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="detail-label">Air Quality</span>
                      <span className={`detail-value text-${color}`} style={{ fontSize: "0.9rem" }}>{status} ({aqi})</span>
                    </div>
                    <ProgressBar
                      now={percentage}
                      variant={color}
                      style={{ height: "8px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.2)" }}
                    />
                  </>
                );
              })()}
            </div>
          )}
          {(weatherData.values.snowDepth || 0) * 100 >= 1 && (
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
          )}
        </div>
      </div>
    </Container>
  );
};

export default CurrentWeather;
