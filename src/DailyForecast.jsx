import { getIcon } from "./WeatherIcons";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Container, Spinner, Alert } from "react-bootstrap";
import "./DailyForecast.css";

const formatDay = (date) => {
  const options = { weekday: "short" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

const DailyForecast = ({ dailyData, loading, error }) => {
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
        <Alert variant="danger">
          {error.message || "Error fetching daily forecast."}
        </Alert>
      </Container>
    );
  }

  // 3. Handle No Data/Initial State or if data structure is unexpected
  const daysToDisplay = dailyData?.slice(1, 7) || []; // Calculate this *after* error/loading checks

  if (!dailyData || dailyData.length === 0) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100%" }}
      >
        <p>Waiting for daily forecast data...</p>
      </Container>
    );
  }

  // 4. Render Weather Data (if loading is false, no error, and data exists)
  return (
    <Container>
      {/* Mobile layout */}
      {daysToDisplay.map((dayData, index) => {
        if (!dayData?.values) return null;

        // Override icon if high chance of rain (>50%) and not already a precipitation code
        let displayWeatherCode = dayData.values.weatherCodeMin;
        if (dayData.values.precipitationProbabilityMax > 50) {
          const precipitationCodes = [
            51, 53, 55, 56, 57, // Drizzle
            61, 63, 65, 66, 67, // Rain
            71, 73, 75, 77,     // Snow
            80, 81, 82,         // Rain showers
            85, 86,             // Snow showers
            95, 96, 99          // Thunderstorm
          ];

          if (!precipitationCodes.includes(displayWeatherCode)) {
            displayWeatherCode = 63; // Force "Rain: Moderate" icon
          }
        }

        return (
          <div key={index}>
            {/* Mobile Row */}
            <Row id="daily-mobile" className="d-md-none my-2 align-items-center">
              <Col xs={4}>
                <p className="fs-6 m-0 text-start ps-2">{formatDay(new Date(dayData.time))}</p>
              </Col>
              <Col xs={4} className="text-center">
                <div className="daily-icon-wrapper">
                  <img
                    className="dailyIcons"
                    src={getIcon(displayWeatherCode, true)}
                    alt="Weather Icon"
                  />
                  {dayData.values.precipitationProbabilityMax > 0 && (
                    <span className="daily-precip-prob">
                      💧{dayData.values.precipitationProbabilityMax}%
                    </span>
                  )}
                </div>
              </Col>
              <Col xs={4}>
                <p className="fs-6 m-0 text-end pe-2">
                  {Math.round(dayData.values.temperatureMin)}°..{Math.round(dayData.values.temperatureMax)}°C
                </p>
              </Col>
            </Row>

            {/* Desktop Row */}
            <Row className="d-flex my-3 d-none d-md-flex align-items-center">
              <Col md={4} className="d-none d-md-flex">
                <p className="fs-5">{formatDay(new Date(dayData.time))}</p>
              </Col>
              <Col md={4} className="d-none d-md-flex justify-content-center">
                <div className="daily-icon-wrapper">
                  <img
                    className="dailyIcons"
                    src={getIcon(displayWeatherCode, true)}
                    alt="Weather Icon"
                  />
                  {dayData.values.precipitationProbabilityMax > 0 && (
                    <span className="daily-precip-prob">
                      💧{dayData.values.precipitationProbabilityMax}%
                    </span>
                  )}
                </div>
              </Col>
              <Col md={4} className="d-none d-md-flex">
                <p className="fs-5">
                  {Math.round(dayData.values.temperatureMin)}°..{Math.round(dayData.values.temperatureMax)}°C
                </p>
              </Col>
            </Row>
          </div>
        );
      })}
    </Container>
  );
};

export default DailyForecast;
