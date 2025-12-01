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
    }
  }, [availableDates, activeDate]);

  // Initial scroll to current hour
  const hasScrolledToCurrentRef = React.useRef(false);

  React.useEffect(() => {
    if (currentHourIso && allHours.length > 0 && !hasScrolledToCurrentRef.current) {
      const timer = setTimeout(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
          const currentIndex = allHours.findIndex(h => h.time.startsWith(currentHourIso.slice(0, 13)));
          if (currentIndex !== -1) {
            // Logic to scroll
            const grid = scrollContainer.querySelector('.unified-forecast-grid');
            // We can estimate width or measure first child
            // Note: We need to be careful if children aren't rendered yet, but this is in useEffect
            const firstItem = scrollContainer.querySelector('.hour-header');
            const cellWidth = firstItem ? firstItem.offsetWidth : 60; // Fallback

            const scrollPosition = currentIndex * cellWidth;

            scrollContainer.scrollTo({
              left: scrollPosition,
              behavior: 'smooth'
            });
            hasScrolledToCurrentRef.current = true;
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentHourIso, allHours]);

  // Handle Scroll to update active tab
  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Measure cell width dynamically
    const firstItem = scrollContainer.querySelector('.hour-header');
    const cellWidth = firstItem ? firstItem.offsetWidth : 50;

    // Calculate visible index based on scroll position
    // We use a slight offset to trigger change when the new day enters significantly
    const scrollLeft = scrollContainer.scrollLeft;
    const index = Math.floor((scrollLeft + 10) / cellWidth);

    if (allHours[index]) {
      const newDate = getLocalDate(allHours[index].time);
      // Only update if different to avoid re-renders
      if (newDate !== activeDate) {
        setActiveDate(newDate);
      }
    }
  };

  // Group hours by day for the header row
  const days = React.useMemo(() => {
    if (!allHours.length) return [];
    const groups = [];
    let currentDay = null;

    allHours.forEach(hour => {
      const date = getLocalDate(hour.time);
      if (!currentDay || currentDay.date !== date) {
        currentDay = { date, hours: [] };
        groups.push(currentDay);
      }
      currentDay.hours.push(hour);
    });
    return groups;
  }, [allHours]);

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

    const todayStr = today.toISOString().slice(0, 10);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    if (dateStr === todayStr) return "Today";
    if (dateStr === tomorrowStr) return "Tomorrow";

    const day = date.getDate();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    return `${weekday} ${day}`;
  };

  // Loading/Error states
  if (loading) return <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}><p>Loading hourly forecast...</p></Container>;
  if (error) return <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}><p>Error loading hourly forecast.</p></Container>;
  if (!hourlyData || hourlyData.length === 0) return <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}><p>No hourly data available.</p></Container>;

  // Scroll to Date
  const scrollToDate = (date) => {
    setActiveDate(date);
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer && allHours.length > 0) {
      // Find the index of the first hour for the selected date
      const index = allHours.findIndex(h => h.time.startsWith(date));

      if (index !== -1) {
        // Measure cell width dynamically or fallback
        const firstItem = scrollContainer.querySelector('.hour-header');
        const cellWidth = firstItem ? firstItem.offsetWidth : 60;

        // Scroll to the start of that day's section
        const scrollPosition = index * cellWidth;

        scrollContainer.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <Container className="hourly-forecast-container p-0">
      {/* Day Navigation Bar */}
      <div className="day-navigation-bar mb-2">
        {days.map(day => (
          <button
            key={day.date}
            className={`day-nav-item ${activeDate === day.date ? 'active' : ''}`}
            onClick={() => scrollToDate(day.date)}
          >
            {formatDateLabel(day.date)}
          </button>
        ))}
      </div>

      <div
        className="unified-forecast-scroll-container"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <div
          className="unified-forecast-grid"
          style={{ '--total-hours': allHours.length }}
        >
          {/* Row 1: Day Headers - REMOVED (Moved to Navigation Bar) */}
          {/* days.map... */}

          {/* Row 2: Hour Headers */}
          {allHours.map((hourData, i) => {
            const hour = getLocalHour(hourData.time);
            const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
            const isPast = currentHourIso && hourData.time < currentHourIso;

            return (
              <div key={`hour-${i}`} className={`grid-cell hour-header ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                {hour}
              </div>
            );
          })}

          {/* Row 3: Icons */}
          {allHours.map((hourData, i) => {
            const isDay = getIsDaytime(hourData.time);
            const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
            const isPast = currentHourIso && hourData.time < currentHourIso;

            return (
              <div key={`icon-${i}`} className={`grid-cell icon-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={renderTooltip(hourData.values.weatherCode)}>
                  <img
                    className="hourlyIcons"
                    src={getIcon(hourData.values.weatherCode, isDay, hourData.values.cloudCover)}
                    alt="Weather Icon"
                  />
                </OverlayTrigger>
              </div>
            );
          })}

          {/* Row 4: Temperature */}
          {allHours.map((hourData, i) => {
            const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
            const isPast = currentHourIso && hourData.time < currentHourIso;

            return (
              <div key={`temp-${i}`} className={`grid-cell temp-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                {Math.round(hourData.values.temperature)}°
              </div>
            );
          })}

          {/* Row 5: Wind */}
          {allHours.map((hourData, i) => {
            const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
            const isPast = currentHourIso && hourData.time < currentHourIso;

            return (
              <div key={`wind-${i}`} className={`grid-cell wind-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                <div className="d-flex flex-column align-items-center">
                  <span
                    className="wind-arrow"
                    style={{ transform: `rotate(${hourData.values.windDirection || 0}deg)` }}
                  >
                    ↓
                  </span>
                  <span className="wind-speed">{Math.round(hourData.values.windSpeed)}</span>
                </div>
              </div>
            );
          })}

          {/* Row 6: Precipitation */}
          {allHours.map((hourData, i) => {
            const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
            const isPast = currentHourIso && hourData.time < currentHourIso;
            const prob = hourData.values.precipitationProbability;

            return (
              <div key={`precip-${i}`} className={`grid-cell precip-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                {prob > 0 && (
                  <div className="precip-data">
                    <span className="precip-prob" style={{ opacity: prob / 100 + 0.3 }}>
                      {prob}%
                    </span>
                    {/* If we had precip amount, we'd show it here */}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
};

export default HourlyForecast;
