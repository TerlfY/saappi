import "./App.css";
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Navbar,
  Form,
  FormControl,
  Button,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import HourlyForecast from "./HourlyForecast";
import CurrentWeather from "./CurrentWeather";
import DailyForecast from "./DailyForecast";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDarkMode } from "./DarkModeContext";

function App() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [cityName, setCityName] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { darkMode, toggleDarkMode } = useDarkMode();

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

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${searchCity}&format=json`
      );

      const searchLocation = searchResponse.data;
      setSearchedLocation({
        latitude: searchLocation[0].lat,
        longitude: searchLocation[0].lon,
        name: searchLocation[0].name,
      });
    } catch (error) {
      console.error("Error searching for the city:", error.message);
      setError("City search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchedLocation && searchedLocation.length > 0) {
      setCityName(searchedLocation[0].name);
    }
  }, [searchedLocation]);

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    console.log("Dark mode toggled:", !darkMode);
  };

  return (
    <Container className={`mx-auto text-center m-4`}>
      {/* Header */}
      <Navbar sticky="top">
        <Container>
          <Navbar.Brand>
            <h1 className="fw-bold">Sääppi</h1>
            <div onClick={handleToggleDarkMode} style={{ cursor: "pointer" }}>
              Dark Mode
            </div>
          </Navbar.Brand>
          <Form className="d-flex" role="search">
            <FormControl
              type="search"
              placeholder="City, Country"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyDown={handleEnterKey}
            />
            <Button
              variant="outline-success"
              type="submit"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : null}
              <span style={{ display: loading ? "none" : "inline" }}>
                Search
              </span>
            </Button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </Form>
        </Container>
      </Navbar>

      {/* Weather modules */}
      <Row>
        <Col
          md={{ order: 2, span: 4 }}
          xs={{ order: 1, span: 12 }}
          id="current-section"
          className="justify-content-center flex-grow-1"
        >
          <CurrentWeather
            currentLocation={
              searchedLocation?.latitude ? searchedLocation : currentLocation
            }
            cityName={searchedLocation?.name || cityName}
          />
        </Col>
        <Col
          md={{ order: 1, span: 4 }}
          xs={{ order: 2, span: 12 }}
          id="hourly-section"
          className="justify-content-center flex-grow-1"
        >
          <HourlyForecast
            currentLocation={
              searchedLocation?.latitude ? searchedLocation : currentLocation
            }
          />
        </Col>
        <Col
          md={{ order: 3, span: 4 }}
          xs={{ order: 3, span: 12 }}
          id="daily-section"
          className="flex-grow-1"
        >
          <DailyForecast
            currentLocation={
              searchedLocation?.latitude ? searchedLocation : currentLocation
            }
          />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
