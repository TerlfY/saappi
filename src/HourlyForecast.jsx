import { getIcon } from "./WeatherIcons";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./HourlyForecast.css";
import { Container } from "react-bootstrap";
import { Spinner, Alert } from "react-bootstrap";

const HourlyForecast = ({ hourlyData, loading, error }) => {
  // Process the data *after* checking loading/error states and if data exists

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
          {error.message || "Error fetching hourly forecast."}
        </Alert>
      </Container>
    );
  }

  // 3. Handle No Data/Initial State or if data structure is unexpected
  // Check specifically for the timelines array needed for mapping
  const hoursToDisplay = hourlyData?.slice(1, 6) || [];
  if (!hourlyData || hoursToDisplay.length === 0) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100%" }}
      >
        <p>Waiting for hourly forecast data...</p>
      </Container>
    );
  }

  // 4. Render Weather Data (if loading is false, no error, and data exists)
  return (
    <Container>
      {/* Mobile layout (visible on extra small and small devices) */}
      <Row id="hourly-mobile" className="d-md-none my-2">
        {hoursToDisplay.map((hourData, index) => {
          const hour = new Date(hourData.time).getHours();
          const isDay = hour >= 6 && hour < 22;
          return (
            <Col
              key={index}
              className="border border-secondary border-bottom-0 border-top-0"
            >
              {/* Ensure hourData and hourData.values exist */}
              {hourData?.values && (
                <Col>
                  <p className="fs-6 m-0">{`${hour}`}</p>
                  <img
                    className="hourlyIcons my-1" //
                    src={getIcon(hourData.values.weatherCode, isDay)} //
                    alt="Weather Icon"
                  />
                  <p className="fs-6 my-1">{`${Math.round(
                    hourData.values.temperature
                  )}°C`}</p>
                </Col>
              )}
            </Col>
          );
        })}
      </Row>

      {/* Desktop layout (visible on medium devices and above) */}
      {hoursToDisplay.map(
        (hourData, index) => {
          // Ensure hourData and hourData.values exist before rendering row
          if (!hourData?.values) return null;
          const hour = new Date(hourData.time).getHours();
          const isDay = hour >= 6 && hour < 22;
          return (
            <Row key={index} className="d-flex my-3 d-none d-md-flex">
              <Col md={4} className="d-none d-md-flex align-items-center">
                <p className="fs-5 m-0">{`${hour}:00`}</p>{" "}
                {/* Added :00 for clarity */}
              </Col>
              <Col
                md={4}
                className="d-none d-md-flex justify-content-center align-items-center"
              >
                <img
                  className="hourlyIcons m-2" //
                  src={getIcon(hourData.values.weatherCode, isDay)} //
                  alt="Weather Icon"
                />
              </Col>
              <Col md={4} className="d-none d-md-flex align-items-center">
                <p className="fs-5 m-0">{`${Math.round(
                  hourData.values.temperature
                )}°C`}</p>
              </Col>
            </Row>
          );
        }
      )}
    </Container>
  );
};

export default HourlyForecast;
