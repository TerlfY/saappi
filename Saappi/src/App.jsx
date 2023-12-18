import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import HourlyForecast from "./HourlyForecast";
import CurrentWeather from "./CurrentWeather";
import DailyForecast from "./DailyForecast";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [cityName, setCityName] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <Container className="mx-auto text-center m-4">
      {/* Header */}
      <Row className="mb-5">
        {/* Darkmode under this */}

        <Col md={6}>
          <h1 className="fw-bold">Sääppi</h1>
        </Col>

        {/* Search */}
        <Col md={6}>
          <Row>
            <Col>
              <input
                type="text"
                placeholder="City, Country"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                onKeyPress={handleEnterKey}
              />

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSearch}
                disabled={loading}
              >
                Search
              </button>
            </Col>
          </Row>
        </Col>
      </Row>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {/* Weather modules */}
      <Row>
        <Col
          md={{ order: 2, span: 4 }}
          xs={{ order: 1, span: 12 }}
          id="current-section"
          className="justify-content-center"
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
          className="justify-content-center"
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
          className="justify-content-center"
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
