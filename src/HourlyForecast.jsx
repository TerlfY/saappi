import React from "react";
import { Container, Row, Col, OverlayTrigger, Tooltip, Nav } from "react-bootstrap";
import { getIcon } from "./WeatherIcons";
import { getWeatherDescription } from "./weatherDescriptions";
import "./HourlyForecast.css";

const HourlyForecast = ({ hourlyData, dailyData, loading, error, timezone }) => {
  const [selectedDate, setSelectedDate] = React.useState(null);

  // Helper to get local date string "YYYY-MM-DD"
  const getLocalDate = (timeString) => {
    return timeString.slice(0, 10);
  };

  // Group data by date
  const groupedData = React.useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return {};
    const groups = {};
    hourlyData.forEach(hour => {
      const date = getLocalDate(hour.time);
      if (!groups[date]) groups[date] = [];
      groups[date].push(hour);
    });
    return groups;
  }, [hourlyData]);

  const availableDates = React.useMemo(() => Object.keys(groupedData).sort(), [groupedData]);

  // Initialize selectedDate if null
  React.useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

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

  // Helper to get local hour integer
  const getLocalHour = (timeString) => {
    return parseInt(timeString.split("T")[1].slice(0, 2), 10);
  };

  // Helper for Day/Night
  const getIsDaytime = (timeString) => {
    const datePart = timeString.slice(0, 10);
    const dayForecast = dailyData.find(d => d.time === datePart);
    if (dayForecast && dayForecast.values.sunriseTime && dayForecast.values.sunsetTime) {
      return timeString >= dayForecast.values.sunriseTime && timeString < dayForecast.values.sunsetTime;
    }
    const hour = getLocalHour(timeString);
    return hour >= 6 && hour < 22;
  };

  // Determine hours to display
  let hoursToDisplay = [];
  if (selectedDate) {
    let dayHours = groupedData[selectedDate] || [];

    // If "Today", filter out past hours
    // We need to know if selectedDate is "Today" in the target timezone
    // We can check if it matches the first available date (usually today)
    // Or better, use the same logic as before to find "now"

    // Let's use the robust "now" calculation from before to filter "Today"
    if (selectedDate === availableDates[0] && timezone) {
      try {
        const formatter = new Intl.DateTimeFormat('sv-SE', {
          timeZone: timezone,
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', hour12: false
        });
        const parts = formatter.formatToParts(new Date());
        const year = parts.find(p => p.type === 'year').value;
        const month = parts.find(p => p.type === 'month').value;
        const day = parts.find(p => p.type === 'day').value;
        const hour = parts.find(p => p.type === 'hour').value;

        const currentHourIso = `${year}-${month}-${day}T${hour}`;

        // Filter hours that are >= current hour
        dayHours = dayHours.filter(h => h.time >= currentHourIso);
      } catch (e) {
        console.error("Error filtering today's hours:", e);
      }
    }

    hoursToDisplay = dayHours;
  }

  const renderTooltip = (code) => (props) => (
    <Tooltip id={`tooltip-${code}`} {...props}>
      {getWeatherDescription(code)}
    </Tooltip>
  );

  // Format date for tab label
  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === availableDates[0]) return "Today"; // Assumption: first date is today
    // Simple check for tomorrow (ignoring timezone edge cases for label simplicity)
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  return (
    <Container className="hourly-forecast-container">
      {/* Tabs */}
      <div className="hourly-tabs-wrapper mb-3">
        <Nav variant="pills" className="flex-nowrap hourly-tabs">
          {availableDates.map(date => (
            <Nav.Item key={date}>
              <Nav.Link
                active={selectedDate === date}
                onClick={() => setSelectedDate(date)}
                className="text-nowrap"
              >
                {formatDateLabel(date)}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </div>

      {/* Mobile Layout (Horizontal Scroll) */}
      <Row id="hourly-mobile" className="d-md-none my-2 flex-nowrap" style={{ overflowX: 'auto' }}>
        {hoursToDisplay.length > 0 ? hoursToDisplay.map((hourData, index) => {
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
                  {hourData.values.precipitationProbability > 20 && (
                    <p className="m-0 precip-prob">
                      💧{hourData.values.precipitationProbability}%
                    </p>
                  )}
                </Col>
              )}
            </Col>
          );
        }) : (
          <p className="text-center w-100 text-muted">No more data for today.</p>
        )}
      </Row>

      {/* Desktop Layout (Horizontal Table-like) */}
      <div className="d-none d-md-block">
        {hoursToDisplay.length > 0 ? (
          <div className="hourly-scroll-container">
            {hoursToDisplay.map((hourData, index) => {
              if (!hourData?.values) return null;
              const hour = getLocalHour(hourData.time);
              const isDay = getIsDaytime(hourData.time);
              const windDir = hourData.values.windDirection || 0;

              return (
                <div key={index} className="hourly-item">
                  {/* Time */}
                  <div className="hourly-time">{hour}:00</div>

                  {/* Icon */}
                  <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={renderTooltip(hourData.values.weatherCode)}>
                    <img
                      className="hourlyIcons"
                      src={getIcon(hourData.values.weatherCode, isDay, hourData.values.cloudCover)}
                      alt="Weather Icon"
                    />
                  </OverlayTrigger>

                  {/* Temperature */}
                  <div className="hourly-temp">{Math.round(hourData.values.temperature)}°</div>

                  {/* Wind */}
                  <div className="hourly-wind">
                    <span
                      className="wind-arrow"
                      style={{ transform: `rotate(${windDir}deg)` }}
                      title={`Wind Direction: ${windDir}°`}
                    >
                      ↓
                    </span>
                    <span>{Math.round(hourData.values.windSpeed)}</span>
                  </div>

                  {/* Precipitation */}
                  <div className="hourly-precip">
                    {hourData.values.precipitationProbability > 20 && (
                      <span className="precip-prob">
                        💧{hourData.values.precipitationProbability}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-3 text-muted">No more data for today.</p>
        )}
      </div>
    </Container>
  );
};

export default HourlyForecast;
