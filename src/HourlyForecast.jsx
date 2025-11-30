import React from "react";
import { Container, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { getIcon } from "./WeatherIcons";
import { getWeatherDescription } from "./weatherDescriptions";
import "./HourlyForecast.css";

const HourlyForecast = ({ hourlyData, dailyData, loading, error, timezone }) => {
  // 1. Handle Loading/Error/Empty States
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
        <p>Loading hourly forecast...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
        <p>Error loading hourly forecast.</p>
      </Container>
    );
  }

  if (!hourlyData || hourlyData.length === 0 || !dailyData) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
        <p>No hourly data available.</p>
      </Container>
    );
  }

  // 2. Determine Start Index based on Target Timezone
  let startIndex = 0;
  if (timezone) {
    try {
      // Use sv-SE for reliable ISO 8601 formatting (YYYY-MM-DD hh:mm:ss)
      const formatter = new Intl.DateTimeFormat('sv-SE', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false
      });

      const parts = formatter.formatToParts(new Date());
      const year = parts.find(p => p.type === 'year').value;
      const month = parts.find(p => p.type === 'month').value;
      const day = parts.find(p => p.type === 'day').value;
      const hour = parts.find(p => p.type === 'hour').value;

      // Construct ISO-like string "YYYY-MM-DDTHH"
      const currentHourIso = `${year}-${month}-${day}T${hour}`;

      startIndex = hourlyData.findIndex(h => h.time.startsWith(currentHourIso));

      // Fallback: if exact hour not found, find first future hour
      if (startIndex === -1) {
        // Construct full ISO string for comparison
        const nowIso = `${year}-${month}-${day}T${hour}:00`;
        startIndex = hourlyData.findIndex(h => h.time > nowIso);
      }
    } catch (e) {
      console.error("Error calculating start index:", e);
    }
  }

  // Default to 0 if calculation failed or returned -1
  startIndex = startIndex >= 0 ? startIndex : 0;

  // 3. Slice the next 7 hours
  const hoursToDisplay = hourlyData.slice(startIndex, startIndex + 7);

  // 4. Helper to get local hour integer for display
  const getLocalHour = (timeString) => {
    // timeString is "YYYY-MM-DDTHH:MM"
    // We can just parse the HH part directly from the string!
    // This avoids all Date object timezone confusion.
    return parseInt(timeString.split("T")[1].slice(0, 2), 10);
  };

  // 5. Helper to determine Day/Night status
  const getIsDaytime = (timeString) => {
    // Extract date part "YYYY-MM-DD"
    const datePart = timeString.slice(0, 10);
    // Find corresponding daily forecast
    const dayForecast = dailyData.find(d => d.time === datePart);

    if (dayForecast && dayForecast.values.sunriseTime && dayForecast.values.sunsetTime) {
      // Direct string comparison of ISO timestamps
      return timeString >= dayForecast.values.sunriseTime && timeString < dayForecast.values.sunsetTime;
    }

    // Fallback: 06:00 to 22:00
    const hour = getLocalHour(timeString);
    return hour >= 6 && hour < 22;
  };

  const renderTooltip = (code) => (props) => (
    <Tooltip id={`tooltip-${code}`} {...props}>
      {getWeatherDescription(code)}
    </Tooltip>
  );

  // 6. Render
  return (
    <Container>
      {/* Mobile Layout (Horizontal Scroll) */}
      <Row id="hourly-mobile" className="d-md-none my-2 flex-nowrap">
        {hoursToDisplay.map((hourData, index) => {
          const hour = getLocalHour(hourData.time);
          const isDay = getIsDaytime(hourData.time);
          return (
            <Col key={index} className="border border-secondary border-bottom-0 border-top-0" style={{ minWidth: "80px" }}>
              {hourData?.values && (
                <Col>
                  <p className="fs-6 m-0">{hour}</p>
                  <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={renderTooltip(hourData.values.weatherCode)}>
                    <img
                      className="hourlyIcons my-1"
                      src={getIcon(hourData.values.weatherCode, isDay, hourData.values.cloudCover)}
                      alt="Weather Icon"
                    />
                  </OverlayTrigger>
                  <p className="fs-6 my-1">{Math.round(hourData.values.temperature)}°C</p>
                  {hourData.values.precipitationProbability > 0 && (
                    <p className="m-0 text-info" style={{ fontSize: "0.75rem" }}>
                      💧{hourData.values.precipitationProbability}%
                    </p>
                  )}
                </Col>
              )}
            </Col>
          );
        })}
      </Row>

      {/* Desktop Layout (Vertical List) */}
      {hoursToDisplay.map((hourData, index) => {
        if (!hourData?.values) return null;
        const hour = getLocalHour(hourData.time);
        const isDay = getIsDaytime(hourData.time);
        return (
          <Row key={index} className="d-flex my-1 py-2 d-none d-md-flex border-bottom border-light-subtle">
            <Col md={4} className="d-none d-md-flex align-items-center">
              <p className="fs-5 m-0">{hour}:00</p>
            </Col>
            <Col md={4} className="d-none d-md-flex justify-content-center align-items-center">
              <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={renderTooltip(hourData.values.weatherCode)}>
                <img
                  className="hourlyIcons m-2"
                  src={getIcon(hourData.values.weatherCode, isDay, hourData.values.cloudCover)}
                  alt="Weather Icon"
                />
              </OverlayTrigger>
            </Col>
            <Col md={4} className="d-none d-md-flex align-items-center">
              <div className="d-flex align-items-center">
                <p className="fs-5 m-0 me-3">{Math.round(hourData.values.temperature)}°C</p>
                {hourData.values.precipitationProbability > 0 && (
                  <div className="d-flex align-items-center text-info" style={{ fontSize: "0.9rem" }}>
                    <span className="me-1">💧</span>
                    <span>{hourData.values.precipitationProbability}%</span>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        );
      })}
    </Container>
  );
};

export default HourlyForecast;
