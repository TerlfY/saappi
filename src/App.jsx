import { useMemo, useEffect, useState } from "react";
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

import "bootstrap/dist/css/bootstrap.min.css";
import { useDarkMode } from "./DarkModeContext";
import useWeatherData from "./useWeatherData";
import "./App.css";
import useGeolocation from "./useGeolocation";
import useReverseGeocode from "./useReverseGeocode";
import useCitySearch from "./useCitySearch";
import { formatLocationName, getCurrentHourData } from "./utils";
import useFavorites from "./useFavorites";
import useTimezone from "./useTimezone";
import useScrollDirection from "./useScrollDirection";


import BackgroundManager from "./BackgroundManager";
import TemperatureChart from "./TemperatureChart";
import SearchBar from "./SearchBar";
import WebcamFeed from "./WebcamFeed";
import WeatherRadar from "./WeatherRadar";
import WeatherEffects from "./WeatherEffects";

import { UnitProvider, useUnits } from "./UnitContext";

function AppContent() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const scrollDirection = useScrollDirection();
  const { unit, toggleUnit, unitLabels } = useUnits();

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

  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();

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

  const [selectedDate, setSelectedDate] = useState(null);
  const [showAllDays, setShowAllDays] = useState(false);

  // Initialize selectedDate when data loads
  useEffect(() => {
    if (forecastData?.timelines?.hourly?.length > 0 && !selectedDate) {
      const firstDate = forecastData.timelines.hourly[0].time.slice(0, 10);
      setSelectedDate(firstDate);
    }
  }, [forecastData, selectedDate]);

  // Filter chart data based on selected date or show all
  const chartData = useMemo(() => {
    if (!forecastData?.timelines?.hourly) return [];

    if (showAllDays) {
      // Return all data, maybe downsample if too large (e.g. every 3rd hour)
      // For 16 days * 24 hours = 384 points, might be okay for Recharts, but let's take every 2nd hour for smoother performance
      return forecastData.timelines.hourly.filter((_, i) => i % 2 === 0);
    }

    if (!selectedDate) return [];
    return forecastData.timelines.hourly.filter(hour => hour.time.startsWith(selectedDate));
  }, [forecastData, selectedDate, showAllDays]);

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
  // Use helper to get the correct hour data based on timezone
  const currentHourData = getCurrentHourData(forecastData?.timelines?.hourly, timezone);
  const currentWeather = currentHourData?.values;

  const dailyValues = forecastData?.timelines?.daily?.[0]?.values;

  // Use isDay from API, default to 1 (Day) if not available
  const isDay = currentWeather?.isDay !== undefined ? currentWeather.isDay : 1;

  return (
    <Container className={`mx-auto text-center m-4`}>
      <BackgroundManager weatherCode={currentWeather?.weatherCode} isDay={isDay} />
      <WeatherEffects weatherCode={currentWeather?.weatherCode} />
      {/* Header */}
      <Navbar sticky="top" className={`transition-navbar ${scrollDirection === "down" ? "navbar-hidden" : "navbar-visible"}`}>
        <Container className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3" style={{ flex: 1 }}>
            <Navbar.Brand>
              <h1 className="fw-bold m-0">Sääppi</h1>
            </Navbar.Brand>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleUnit}
              className="rounded-pill px-3"
              style={{
                backdropFilter: "blur(5px)",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: darkMode ? "white" : "black",
                border: "1px solid rgba(255,255,255,0.2)"
              }}
            >
              {unit === "metric" ? "°C" : "°F"}
            </Button>
          </div>

          <div style={{ flex: 2 }}>
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
              favorites={favorites}
              onFavoriteSelect={(fav) => {
                setSearchedLocation(fav);
                handleSearchInputChange({ target: { value: "" } });
              }}
            />
          </div>
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
      <Row className="mt-4 main-layout-row">
        {/* Left Sidebar: Current Weather & Daily Forecast */}
        <Col md={4} className="mb-5">


          <div id="current-section" className="mb-4">
            <CurrentWeather
              weatherData={currentHourData}
              dailyValues={forecastData?.timelines?.daily?.[0]?.values}
              loading={forecastLoading}
              error={forecastError}
              cityName={displayCityName}
              location={locationToFetch}
              timezone={timezone}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              onLocationReset={() => {
                setSearchedLocation(null);
                handleSearchInputChange({ target: { value: "" } });
              }}
              isFavorite={isFavorite(locationToFetch)}
              onToggleFavorite={() => {
                if (isFavorite(locationToFetch)) {
                  removeFavorite(locationToFetch);
                } else {
                  addFavorite({ ...locationToFetch, name: displayCityName });
                }
              }}
            />
          </div>



          {/* Webcam Feed */}
          <WebcamFeed location={locationToFetch} darkMode={darkMode} timezone={timezone} />




        </Col>

        {/* Main Area: Chart & Hourly Forecast */}
        <Col md={8}>
          <div id="hourly-section">
            <HourlyForecast
              hourlyData={forecastData?.timelines?.hourly}
              dailyData={forecastData?.timelines?.daily}
              loading={forecastLoading}
              error={forecastError}
              timezone={timezone}
              darkMode={darkMode}
              activeDate={selectedDate}
              onDateChange={setSelectedDate}
              chart={
                !forecastLoading && !forecastError && forecastData?.timelines?.hourly && (
                  <TemperatureChart
                    data={chartData}
                    darkMode={darkMode}
                    timezone={timezone}
                    isDay={isDay}
                    showAllDays={showAllDays}
                    onToggleShowAllDays={() => setShowAllDays(!showAllDays)}
                  />
                )
              }
            />
          </div>

          {/* Weather Radar */}
          <div id="radar-section" className="mt-4">
            <WeatherRadar location={locationToFetch} />
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

function App() {
  return (
    <UnitProvider>
      <AppContent />
    </UnitProvider>
  );
}

export default App;
