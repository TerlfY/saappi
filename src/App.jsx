import "./App.css";
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
import HourlyForecast from "./HourlyForecast";
import CurrentWeather from "./CurrentWeather";
import DailyForecast from "./DailyForecast";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDarkMode } from "./DarkModeContext";
import useWeatherData from "./useWeatherData";

function App() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [cityName, setCityName] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchedLocation, setSearchedLocation] = useState(null);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });

          try {
            const cityResponse = await axios.get(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const city = cityResponse.data.locality;
            setCityName(city);
          } catch (error) {
            console.error("Error getting city name:", error.message);
          }
        },
        (error) => {
          console.error("Error getting current location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser");
    }
  }, []);

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

  // Fetch forecast data once here
  const {
    data: forecastData,
    loading: forecastLoading,
    error: forecastError,
  } = useWeatherData("forecast", forecastParams); //

  const handleSearch = async (e) => {
    // Prevent default form submission if triggered by button type="submit"
    if (e) e.preventDefault();
    try {
      setSearchLoading(true);
      setSearchError(null);

      const searchResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${searchCity}&format=json`
      );

      const searchResult = searchResponse.data;
      if (searchResult && searchResult.length > 0) {
        setSearchedLocation({
          latitude: parseFloat(searchResult[0].lat),
          longitude: parseFloat(searchResult[0].lon),
          name: searchResult[0].display_name,
        });
        setCityName(searchResult[0].display_name);
      } else {
        setSearchError("City not found.");
        setSearchedLocation(null);
      }
    } catch (error) {
      console.error("Error searching for the city:", error.message);
      setSearchError("City search failed. Please try again.");
      setSearchedLocation(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    console.log("Dark mode toggled:", !darkMode);
  };

  const displayCityName =
    searchedLocation?.name || cityName || "Loading city...";

  return (
    <Container className={`mx-auto text-center m-4`}>
      {/* Header */}
      <Navbar sticky="top">
        <Container>
          <Navbar.Brand>
            <h1 className="fw-bold">Sääppi</h1>
          </Navbar.Brand>
          <Form className="d-flex" role="search" onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="City, Country"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyDown={handleEnterKey}
              aria-label="Search City"
            />
            <Button
              variant="outline-success"
              type="submit"
              disabled={searchLoading}
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
            currentLocation={locationToFetch}
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
