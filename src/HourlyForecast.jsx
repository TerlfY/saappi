import { getIcon } from "./WeatherIcons";
import { getWeatherDescription } from "./weatherDescriptions";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./HourlyForecast.css";
import { Container, Spinner, Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import SkeletonWeather from "./SkeletonWeather";


const HourlyForecast = ({ hourlyData, dailyData, loading, error, timezone, darkMode }) => {
  // Process the data *after* checking loading/error states and if data exists

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

  // Helper to get hour in location's timezone
  const getLocalHour = (timeString) => {
    if (!timezone) return new Date(timeString).getHours();

    try {
      const hourString = new Date(timeString).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        hour12: false,
        timeZone: timezone,
      });
      return parseInt(hourString, 10);
    } catch (e) {
      console.warn("Invalid timezone:", timezone);
      return new Date(timeString).getHours();
    }
  };

  // Helper to get YYYY-MM-DD in location's timezone
  const getDateInTimezone = (isoString, tz) => {
    if (!tz) return new Date(isoString).toLocaleDateString("en-CA");
    try {
      return new Date(isoString).toLocaleDateString("en-CA", { timeZone: tz });
    } catch (e) {
      console.warn("Invalid timezone for date:", tz);
      return new Date(isoString).toLocaleDateString("en-CA");
    }
  };

  const isDaytime = (timeString) => {
    if (!dailyData) {
      // Fallback
      const hour = getLocalHour(timeString);
      return hour >= 6 && hour < 22;
    }

    const targetDateStr = getDateInTimezone(timeString, timezone);

    // Find the daily forecast for this date using timezone-aware string comparison
    const dayForecast = dailyData.find(d => {
      const dDateStr = getDateInTimezone(d.time, timezone);
      return dDateStr === targetDateStr;
    });

    if (dayForecast && dayForecast.values.sunriseTime && dayForecast.values.sunsetTime) {
      const date = new Date(timeString);
      const sunrise = new Date(dayForecast.values.sunriseTime);
      const sunset = new Date(dayForecast.values.sunsetTime);
      return date >= sunrise && date < sunset;
    }

    // Fallback if no matching day or sunrise/sunset data
    const hour = getLocalHour(timeString);
    return hour >= 6 && hour < 22;
  };

  const renderTooltip = (code) => (props) => (
    <Tooltip id={`tooltip-${code}`} {...props}>
      {getWeatherDescription(code)}
    </Tooltip>
  );

  // 4. Render Weather Data (if loading is false, no error, and data exists)
  return (
    <Container>
      {/* Mobile layout (visible on extra small and small devices) */}
      <Row id="hourly-mobile" className="d-md-none my-2 flex-nowrap">
        {hoursToDisplay.map((hourData, index) => {
          const hour = getLocalHour(hourData.time);
          const isDay = isDaytime(hourData.time);
          return (
            <Col
              key={index}
              className="border border-secondary border-bottom-0 border-top-0"
              style={{ minWidth: "80px" }} // Ensure items don't shrink
            >
              {/* Ensure hourData and hourData.values exist */}
              {hourData?.values && (
                <Col>
                  <p className="fs-6 m-0">{`${hour}`}</p>
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip(hourData.values.weatherCode)}
                  >
                    <img
                      className="hourlyIcons my-1" //
                      src={getIcon(
                        hourData.values.weatherCode,
                        isDay,
                        hourData.values.cloudCover
                      )} //
                      alt="Weather Icon"
                    />
                  </OverlayTrigger>
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
      {/* Chart moved to App.jsx */}

      {hoursToDisplay.map(
        (hourData, index) => {
          // Ensure hourData and hourData.values exist before rendering row
          if (!hourData?.values) return null;
          const hour = getLocalHour(hourData.time);
          const isDay = isDaytime(hourData.time);
          return (
            <Row key={index} className="d-flex my-1 py-2 d-none d-md-flex border-bottom border-light-subtle">
              <Col md={4} className="d-none d-md-flex align-items-center">
                <p className="fs-5 m-0">{`${hour}:00`}</p>{" "}
                {/* Added :00 for clarity */}
              </Col>
              <Col
                md={4}
                className="d-none d-md-flex justify-content-center align-items-center"
              >
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={renderTooltip(hourData.values.weatherCode)}
                >
                  <img
                    className="hourlyIcons m-2" //
                    src={getIcon(
                      hourData.values.weatherCode,
                      isDay,
                      hourData.values.cloudCover
                    )} //
                    alt="Weather Icon"
                  />
                </OverlayTrigger>
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
