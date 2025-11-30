import React from "react";
import { Container, Row, Col, OverlayTrigger, Tooltip, Nav } from "react-bootstrap";
import { getIcon } from "./WeatherIcons";
import { getWeatherDescription } from "./weatherDescriptions";
import "./HourlyForecast.css";

const HourlyForecast = ({ hourlyData, dailyData, loading, error, timezone }) => {
  const [activeDate, setActiveDate] = React.useState(null);
  const scrollContainerRef = React.useRef(null);
  const mobileScrollContainerRef = React.useRef(null);

  // Helper to get local date string "YYYY-MM-DD"
  const getLocalDate = (timeString) => {
    return timeString.slice(0, 10);
  };

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

  // Prepare continuous list of hours
  const allHours = React.useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return [];
    // Return all hours without filtering past ones
    return [...hourlyData];
  }, [hourlyData]);

  // Get unique dates for tabs
  const availableDates = React.useMemo(() => {
    const dates = new Set(allHours.map(h => getLocalDate(h.time)));
    return Array.from(dates).sort();
  }, [allHours]);

  // Calculate current hour ISO for comparison
  const currentHourIso = React.useMemo(() => {
    if (!timezone) return null;
    try {
      const formatter = new Intl.DateTimeFormat('sv-SE', {
        timeZone: timezone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', hour12: false
      });
      const parts = formatter.formatToParts(new Date());
      const year = parts.find(p => p.type === 'year')?.value;
      const month = parts.find(p => p.type === 'month')?.value;
      const day = parts.find(p => p.type === 'day')?.value;
      const hour = parts.find(p => p.type === 'hour')?.value;

      if (year && month && day && hour) {
        // OpenMeteo uses "YYYY-MM-DDTHH:00" format
        return `${year}-${month}-${day}T${hour}:00`;
      }
    } catch (e) {
      console.error("Error calculating current hour:", e);
    }
    return null;
  }, [timezone]);

  // Initialize activeDate
  React.useEffect(() => {
    if (!activeDate && availableDates.length > 0) {
      setActiveDate(availableDates[0]);

      // Initial scroll to current hour if available, otherwise start of day
      setTimeout(() => {
        if (currentHourIso) {
          // Try to scroll to current hour
          const scrollContainer = (window.innerWidth >= 768) ? scrollContainerRef.current : mobileScrollContainerRef.current;
          const containerId = (window.innerWidth >= 768) ? 'hourly-desktop' : 'hourly-mobile';
          const targetId = `hour-${currentHourIso}-${containerId}`;
          const element = document.getElementById(targetId);

          if (element && scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            // Center the current hour or show it with some context (e.g. 1 item before)
            const offset = elementRect.left - containerRect.left + scrollContainer.scrollLeft - (elementRect.width * 1.5);

            scrollContainer.scrollTo({
              left: Math.max(0, offset),
              behavior: 'smooth'
            });
            return;
          }
        }
      }, 100);
    }
  }, [availableDates, activeDate, currentHourIso]);

  // Scroll Handler (ScrollSpy)
  const handleScroll = (e) => {
    const container = e.target;
    const containerLeft = container.getBoundingClientRect().left;

    // Better ScrollSpy:
    // Get all child elements with data-date
    const items = Array.from(container.children).filter(child => child.hasAttribute('data-date'));

    // Find the first item that is at least partially visible or close to left
    // We want the date of the item that is currently at the left edge

    // Offset for "active" area (e.g. 50px from left)
    const triggerPoint = containerLeft + 50;

    for (const item of items) {
      const rect = item.getBoundingClientRect();
      if (rect.right > triggerPoint) {
        const date = item.getAttribute('data-date');
        if (date && date !== activeDate) {
          setActiveDate(date);
        }
        break; // Found the leftmost visible item
      }
    }
  };

  // Scroll to Date
  const scrollToDate = (date) => {
    setActiveDate(date);

    // Determine which container is visible (Desktop or Mobile)
    // We can try scrolling both or checking visibility
    // Let's use the refs

    const scrollContainer = (window.innerWidth >= 768) ? scrollContainerRef.current : mobileScrollContainerRef.current;
    const containerId = (window.innerWidth >= 768) ? 'hourly-desktop' : 'hourly-mobile';

    if (scrollContainer) {
      const targetId = `day-start-${date}-${containerId}`;
      const element = document.getElementById(targetId);

      if (element) {
        // Calculate offset relative to container
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const offset = elementRect.left - containerRect.left + scrollContainer.scrollLeft;

        scrollContainer.scrollTo({
          left: offset,
          behavior: 'smooth'
        });
      }
    }
  };

  const renderTooltip = (code) => (props) => (
    <Tooltip id={`tooltip-${code}`} {...props}>
      {getWeatherDescription(code)}
    </Tooltip>
  );

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today (using local date string comparison to be safe)
    // const todayStr = today.toISOString().slice(0, 10); // Rough check, but availableDates[0] is safer if sorted

    if (dateStr === availableDates[0]) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  // Loading/Error states
  if (loading) return <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}><p>Loading hourly forecast...</p></Container>;
  if (error) return <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}><p>Error loading hourly forecast.</p></Container>;
  if (!hourlyData || hourlyData.length === 0) return <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}><p>No hourly data available.</p></Container>;

  return (
    <Container className="hourly-forecast-container">
      {/* Tabs */}
      <div className="hourly-tabs-wrapper mb-3">
        <Nav variant="pills" className="flex-nowrap hourly-tabs">
          {availableDates.map(date => (
            <Nav.Item key={date}>
              <Nav.Link
                active={activeDate === date}
                onClick={() => scrollToDate(date)}
                className="text-nowrap"
                style={{ cursor: 'pointer' }}
              >
                {formatDateLabel(date)}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </div>

      {/* Mobile Layout (Horizontal Scroll) */}
      <Row
        id="hourly-mobile"
        className="d-md-none my-2 flex-nowrap"
        style={{ overflowX: 'auto' }}
        onScroll={handleScroll}
        ref={mobileScrollContainerRef}
      >
        {allHours.map((hourData, index) => {
          const hour = getLocalHour(hourData.time);
          const isDay = getIsDaytime(hourData.time);
          const date = getLocalDate(hourData.time);
          const isFirstOfDay = index === 0 || getLocalDate(allHours[index - 1].time) !== date;

          // Determine status
          let statusClass = "";
          if (currentHourIso) {
            // Compare ISO strings directly
            if (hourData.time < currentHourIso) statusClass = "past";
            else if (hourData.time.startsWith(currentHourIso.slice(0, 13))) statusClass = "current"; // Compare up to hour
          }

          return (
            <Col
              key={index}
              className={`border border-secondary border-bottom-0 border-top-0 position-relative ${statusClass}`}
              style={{ minWidth: "70px" }}
              data-date={date}
              id={isFirstOfDay ? `day-start-${date}-hourly-mobile` : undefined}
            >
              {/* Add ID for specific hour targeting */}
              <div id={`hour-${hourData.time}-hourly-mobile`} style={{ position: 'absolute', top: 0, left: 0 }} />

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

                  <div className="d-flex flex-column align-items-center mb-1" style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                    <span
                      className="wind-arrow"
                      style={{ transform: `rotate(${hourData.values.windDirection || 0}deg)`, fontSize: "1rem" }}
                    >
                      ↓
                    </span>
                    <span>{Math.round(hourData.values.windSpeed)}</span>
                  </div>

                  {hourData.values.precipitationProbability > 20 && (
                    <p className="m-0 precip-prob">
                      💧{hourData.values.precipitationProbability}%
                    </p>
                  )}
                </Col>
              )}
            </Col>
          );
        })}
      </Row>

      {/* Desktop Layout (Horizontal Table-like) */}
      <div className="d-none d-md-block">
        <div
          id="hourly-desktop"
          className="hourly-scroll-container"
          onScroll={handleScroll}
          ref={scrollContainerRef}
        >
          {allHours.map((hourData, index) => {
            if (!hourData?.values) return null;
            const hour = getLocalHour(hourData.time);
            const isDay = getIsDaytime(hourData.time);
            const windDir = hourData.values.windDirection || 0;
            const date = getLocalDate(hourData.time);
            const isFirstOfDay = index === 0 || getLocalDate(allHours[index - 1].time) !== date;

            // Determine status
            let statusClass = "";
            if (currentHourIso) {
              // Compare ISO strings directly
              if (hourData.time < currentHourIso) statusClass = "past";
              else if (hourData.time.startsWith(currentHourIso.slice(0, 13))) statusClass = "current"; // Compare up to hour
            }

            return (
              <div
                key={index}
                className={`hourly-item ${statusClass}`}
                data-date={date}
                id={isFirstOfDay ? `day-start-${date}-hourly-desktop` : undefined}
              >
                {/* Add ID for specific hour targeting */}
                <div id={`hour-${hourData.time}-hourly-desktop`} style={{ position: 'absolute', top: 0 }} />

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
      </div>
    </Container>
  );
};

export default HourlyForecast;
