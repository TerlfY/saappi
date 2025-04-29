import { getIcon } from "./WeatherIcons"; //
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Container, Spinner, Alert } from "react-bootstrap"; // Import Spinner and Alert
import "./DailyForecast.css"; //

// Helper function remains the same
const formatDay = (date) => {
  const options = { weekday: "short" };
  // Using 'en-US' for broader compatibility, adjust if 'fi-FI' is essential
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

const DailyForecast = ({ dailyData, loading, error }) => {
  //
  // Call the custom hook for daily forecast data

  // Process the data *after* checking loading/error states and if data exists
  // Derive the forecast array only when data is available
  // Taking 6 days starting from the *second* day (index 1 to 6) as per original slice(1, 7)
  const next6DaysForecast = dailyData?.timelines?.daily?.slice(1, 7) || []; //

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
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // 3. Handle No Data/Initial State or if data structure is unexpected
  // Check specifically for the timelines array needed for mapping
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
      {(dailyData.slice(1.7) || []).map(
        (dayData, index) =>
          // Ensure dayData and dayData.values exist before rendering row
          dayData?.values && (
            <Row
              id="daily-mobile"
              key={`mobile-${index}`}
              className="d-md-none my-2 align-items-center"
            >
              {" "}
              {/* */}
              <Col xs={4}>
                {" "}
                {/* Using explicit grid columns for better alignment */}
                <p className="fs-6 m-0 text-start ps-2">{`${formatDay(
                  new Date(dayData.time)
                )}`}</p>
              </Col>
              <Col xs={4} className="text-center">
                <img
                  className="dailyIcons" //
                  src={getIcon(dayData.values.weatherCodeMin)} //
                  alt="Weather Icon"
                />
              </Col>
              <Col xs={4}>
                <p className="fs-6 m-0 text-end pe-2">{`${Math.round(
                  dayData.values.temperatureMin
                )}°..${Math.round(dayData.values.temperatureMax)}°C`}</p>{" "}
                {/* */}
              </Col>
            </Row>
          )
      )}

      {/* Desktop layout */}
      {(dailyData.slice(1.7) || []).map(
        (dayData, index) =>
          // Ensure dayData and dayData.values exist before rendering row
          dayData?.values && (
            <Row
              key={`desktop-${index}`}
              className="d-flex my-3 d-none d-md-flex align-items-center"
            >
              {" "}
              {/* */}
              <Col md={4} className="d-none d-md-flex">
                <p className="fs-5">{`${formatDay(new Date(dayData.time))}`}</p>{" "}
                {/* */}
              </Col>
              <Col md={4} className="d-none d-md-flex justify-content-center">
                <img
                  className="dailyIcons" //
                  src={getIcon(dayData.values.weatherCodeMin)} //
                  alt="Weather Icon"
                />
              </Col>
              <Col md={4} className="d-none d-md-flex">
                <p className="fs-5">{`${Math.round(
                  dayData.values.temperatureMin
                )}°..${Math.round(dayData.values.temperatureMax)}°C`}</p>{" "}
                {/* */}
              </Col>
            </Row>
          )
      )}
    </Container>
  );
};

export default DailyForecast;
