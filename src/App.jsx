import { useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Navbar,
  Button,
  Alert,
} from "react-bootstrap";
import HourlyForecast from "./HourlyForecast";
import CurrentWeather from "./CurrentWeather";
import DailyForecast from "./DailyForecast";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDarkMode } from "./DarkModeContext";
import useWeatherData from "./useWeatherData";
import "./App.css";
import useGeolocation from "./useGeolocation";
import useReverseGeocode from "./useReverseGeocode";
import useCitySearch from "./useCitySearch";
import { formatLocationName } from "./utils";
import useTimezone from "./useTimezone";
import BackgroundManager from "./BackgroundManager";
import TemperatureChart from "./TemperatureChart";
import SearchBar from "./SearchBar";

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Custom Hooks
  const { currentLocation } = useGeolocation();
  const { cityName: reverseGeocodedCityName } = useReverseGeocode(currentLocation);
  const {
    searchCity,
    searchedLocation,
    setSearchedLocation,
    searchError,
    setSearchError,
    showSuggestions,
    searchResults,
    searchLoading,
    handleSuggestionClick,
    handleSearchInputChange,
    handleKeyDown,
    highlightedIndex,
  } = useCitySearch();

  // --- Determine the location to use for weather fetching ---
  const locationToFetch = useMemo(() => {
    if (searchedLocation) {
      const hasValidCoords =
        Number.isFinite(searchedLocation.latitude) &&
        Number.isFinite(searchedLocation.longitude);
      return hasValidCoords ? searchedLocation : currentLocation;
    }
    return currentLocation;
  }, [searchedLocation, currentLocation]);

  const { timezone } = useTimezone(locationToFetch);

  // --- Fetch Forecast Data (Hourly & Daily) ---
  const forecastParams = useMemo(
    () => ({
      location: locationToFetch
        ? `${locationToFetch.latitude},${locationToFetch.longitude}`
        : null,
    }),
    [locationToFetch]
  );

  const {
    data: forecastData,
    loading: forecastLoading,
    error: forecastError,
  } = useWeatherData("forecast", forecastParams);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    // No manual trigger needed, debounced value handles it
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const displayCityName =
    searchedLocation?.name || reverseGeocodedCityName || "Loading city...";

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("body-dark-mode");
    } else {
      document.body.classList.remove("body-dark-mode");
    }
    return () => {
      document.body.classList.remove("body-dark-mode");
    };
  }, [darkMode]);

  // Determine current weather code and isDay for BackgroundManager
  const currentWeather = forecastData?.timelines?.hourly?.[0]?.values;
  const dailyValues = forecastData?.timelines?.daily?.[0]?.values;
  let isDay = true;
  if (dailyValues?.sunriseTime && dailyValues?.sunsetTime) {
    const now = new Date();
    const sunrise = new Date(dailyValues.sunriseTime);
    const sunset = new Date(dailyValues.sunsetTime);
    isDay = now >= sunrise && now < sunset;
  } else if (timezone) {
    // Fallback using timezone
    try {
      const hourString = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        hour12: false,
        timeZone: timezone,
      });
      const hour = parseInt(hourString, 10);
      isDay = hour >= 6 && hour < 22;
    } catch (e) {
      console.warn("Invalid timezone for background:", timezone);
    }
  }

  return (
    <Container className={`mx-auto text-center m-4`}>
      <BackgroundManager weatherCode={currentWeather?.weatherCode} isDay={isDay} />
      {/* Header */}
      <Navbar sticky="top">
        <Container>
          <Navbar.Brand>
            <h1 className="fw-bold">Sääppi</h1>
          </Navbar.Brand>
          <SearchBar
            value={searchCity}
            onChange={handleSearchInputChange}
            onSubmit={handleSearch}
            onClear={() => handleSearchInputChange({ target: { value: "" } })}
            suggestions={searchResults}
            onSuggestionClick={handleSuggestionClick}
            loading={searchLoading}
            error={searchError}
            highlightedIndex={highlightedIndex}
            onKeyDown={(e) => {
              handleEnterKey(e);
              handleKeyDown(e);
            }}
            showSuggestions={showSuggestions}
          />
          <Button
            variant={darkMode ? "light" : "dark"}
            onClick={toggleDarkMode}
            className="ms-2"
          >
            {darkMode ? "☀️" : "🌙"}
          </Button>
        </Container>
      </Navbar>

      {/* Display general forecast error if it occurs */}
      {forecastError && (
        <Alert variant="danger" className="mt-3">
          {forecastError.message ||
            "An error occurred while fetching weather data."}
        </Alert>
      )}

      {/* Dashboard Layout */}
      <Row className="mt-4">
        {/* Left Sidebar: Current Weather & Daily Forecast */}
        <Col md={4} className="mb-4">
          <div id="current-section" className="mb-4">
            <CurrentWeather
              weatherData={forecastData?.timelines?.hourly?.[0]}
              dailyValues={forecastData?.timelines?.daily?.[0]?.values}
              loading={forecastLoading}
              error={forecastError}
              cityName={displayCityName}
              timezone={timezone}
            />
          </div>
          <div id="daily-section">
            <DailyForecast
              dailyData={forecastData?.timelines?.daily}
              loading={forecastLoading}
              error={forecastError}
            />
          </div>
        </Col>

        {/* Main Area: Chart & Hourly Forecast */}
        <Col md={8}>
          {!forecastLoading && !forecastError && forecastData?.timelines?.hourly && (
            <div id="chart-section" className="mb-4" style={{ minHeight: "300px" }}>
              <h3 className="mb-3">Temperature Trend</h3>
              <TemperatureChart
                data={forecastData.timelines.hourly.slice(0, 24)}
                darkMode={darkMode}
              />
            </div>
          )}
          <div id="hourly-section">
            <HourlyForecast
              hourlyData={forecastData?.timelines?.hourly}
              dailyData={forecastData?.timelines?.daily}
              loading={forecastLoading}
              error={forecastError}
              timezone={timezone}
              darkMode={darkMode}
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>TerlfY is the Proud Dad of Sääppi</p>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
