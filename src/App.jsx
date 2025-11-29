import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Navbar,
  Form,
  FormControl,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import HourlyForecast from "./HourlyForecast";
import CurrentWeather from "./CurrentWeather";
import DailyForecast from "./DailyForecast";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDarkMode } from "./DarkModeContext";
import useWeatherData from "./useWeatherData";
import "./App.css";
import { reverseGeocodeSchema, searchResultSchema } from "./schemas";
import useDebounce from "./useDebounce";

// --- Fetchers ---
const fetchReverseGeocode = async ({ queryKey }) => {
  const [_, lat, lon] = queryKey;
  const response = await axios.get(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
  );
  return reverseGeocodeSchema.parse(response.data);
};

const fetchCitySearch = async ({ queryKey }) => {
  const [_, city] = queryKey;
  const response = await axios.get(
    `https://nominatim.openstreetmap.org/search?q=${city}&format=json`
  );
  return searchResultSchema.parse(response.data);
};

function App() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchCity, setSearchCity] = useState("");
  const [searchedLocation, setSearchedLocation] = useState(null);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [searchError, setSearchError] = useState(null);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectionMade, setSelectionMade] = useState(false);

  const debouncedSearchCity = useDebounce(searchCity, 500);

  // --- Get Current Location ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting current location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser");
    }
  }, []);

  // --- Reverse Geocoding Query ---
  const { data: reverseGeocodeData } = useQuery({
    queryKey: [
      "reverseGeocode",
      currentLocation?.latitude,
      currentLocation?.longitude,
    ],
    queryFn: fetchReverseGeocode,
    enabled: !!currentLocation,
    staleTime: Infinity, // City name for coordinates unlikely to change
  });

  const cityName = reverseGeocodeData?.locality || reverseGeocodeData?.city;

  // --- Search Query ---
  const {
    data: searchResults,
    isFetching: searchLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["search", debouncedSearchCity],
    queryFn: fetchCitySearch,
    enabled: !!debouncedSearchCity, // Auto-trigger when debounced value exists
    retry: false,
  });

  // Show suggestions when results come in
  useEffect(() => {
    if (selectionMade) return; // Don't reopen if we just made a selection

    if (searchResults && searchResults.length > 0) {
      setShowSuggestions(true);
      setSearchError(null);
    } else if (searchResults && searchResults.length === 0) {
      setShowSuggestions(false);
      setSearchError("City not found.");
    }
  }, [searchResults, selectionMade]);

  // Handle errors from the query
  useEffect(() => {
    if (queryError) {
      console.error("Error searching for the city:", queryError);
      setSearchError("City search failed. Please try again.");
    }
  }, [queryError]);

  const handleSuggestionClick = (result) => {
    setSelectionMade(true); // Mark as selected
    setSearchedLocation({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      name: result.display_name,
    });
    setSearchCity(result.display_name);
    setShowSuggestions(false);
  };

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
      // Optional: Force immediate search if we wanted, but debounce covers it
    }
  };

  const handleToggleDarkMode = () => {
    toggleDarkMode();
  };

  const displayCityName =
    searchedLocation?.name || cityName || "Loading city...";

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

  return (
    <Container className={`mx-auto text-center m-4`}>
      {/* Header */}
      <Navbar sticky="top">
        <Container>
          <Navbar.Brand>
            <h1 className="fw-bold">Sääppi</h1>
          </Navbar.Brand>
          <Form className="d-flex position-relative" role="search" onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="City, Country"
              value={searchCity}
              onChange={(e) => {
                setSearchCity(e.target.value);
                setSelectionMade(false); // Reset selection state when typing
                if (e.target.value === "") setShowSuggestions(false);
              }}
              onKeyDown={handleEnterKey}
              aria-label="Search City"
            />
            {showSuggestions && searchResults && (
              <div className="suggestions-dropdown">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(result)}
                  >
                    {result.display_name}
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline-success"
              type="submit"
              disabled={searchLoading}
              className="ms-2"
            >
              {searchLoading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                <span>Search</span>
              )}
            </Button>
            {/* Display search error near the search bar */}
            {searchError && (
              <Alert variant="danger" className="ms-2 mb-0 p-2">
                {searchError}
              </Alert>
            )}
          </Form>
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

      {/* Weather modules */}
      <Row>
        <Col
          md={{ order: 2, span: 4 }}
          xs={{ order: 1, span: 12 }}
          id="current-section"
          className="justify-content-center flex-grow-1"
        >
          <CurrentWeather
            weatherData={forecastData?.timelines?.hourly?.[0]}
            loading={forecastLoading}
            error={forecastError}
            cityName={displayCityName}
          />
        </Col>
        <Col
          md={{ order: 1, span: 4 }}
          xs={{ order: 2, span: 12 }}
          id="hourly-section"
          className="justify-content-center flex-grow-1"
        >
          <HourlyForecast
            hourlyData={forecastData?.timelines?.hourly}
            loading={forecastLoading}
            error={forecastError}
          />
        </Col>
        <Col
          md={{ order: 3, span: 4 }}
          xs={{ order: 3, span: 12 }}
          id="daily-section"
          className="flex-grow-1"
        >
          <DailyForecast
            dailyData={forecastData?.timelines?.daily}
            loading={forecastLoading}
            error={forecastError}
          />
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
