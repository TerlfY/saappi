import React from "react";
import { Container, OverlayTrigger, Tooltip } from "react-bootstrap";
import { getIcon } from "./WeatherIcons";
import { getWeatherDescription } from "./weatherDescriptions";
import "./HourlyForecast.css";
import useDraggableScroll from "./useDraggableScroll";
import { useUnits } from "./UnitContext";
import { useLanguage } from "./LanguageContext";
import { WeatherData, DailyForecast } from "./types";

interface HourlyForecastProps {
    hourlyData: WeatherData[];
    dailyData: DailyForecast[];
    loading: boolean;
    error: any;
    timezone: string;
    activeDate: string;
    onDateChange: (date: string) => void;
    chart: React.ReactNode;
    darkMode: boolean;
}

const HourlyForecast: React.FC<HourlyForecastProps> = React.memo(({ hourlyData, dailyData, loading, error, timezone, activeDate, onDateChange, chart, darkMode }) => {
    const { getTemperature, getSpeed, getPrecip, formatDate, formatTime, unitLabels } = useUnits();
    const { t, language } = useLanguage();
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const navContainerRef = React.useRef<HTMLDivElement>(null);

    useDraggableScroll(scrollContainerRef);
    useDraggableScroll(navContainerRef);

    // Helper to get local date string "YYYY-MM-DD"
    const getLocalDate = (timeString: string) => {
        return timeString.slice(0, 10);
    };

    // Helper to get local hour integer
    const getLocalHour = (timeString: string) => {
        return parseInt(timeString.split("T")[1].slice(0, 2), 10);
    };

    // Helper for Day/Night
    const getIsDaytime = (timeString: string) => {
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
                return `${year}-${month}-${day}T${hour}:00`;
            }
        } catch (e) {
            console.error("Error calculating current hour:", e);
        }
        return null;
    }, [timezone]);

    // Initialize activeDate if not set
    React.useEffect(() => {
        if (!activeDate && availableDates.length > 0 && onDateChange) {
            onDateChange(availableDates[0]);
        }
    }, [availableDates, activeDate, onDateChange]);

    // Initial scroll to current hour
    const hasScrolledToCurrentRef = React.useRef(false);

    React.useEffect(() => {
        if (currentHourIso && allHours.length > 0 && !hasScrolledToCurrentRef.current) {
            const timer = setTimeout(() => {
                const scrollContainer = scrollContainerRef.current;
                if (scrollContainer) {
                    const currentIndex = allHours.findIndex(h => h.time.startsWith(currentHourIso.slice(0, 13)));
                    if (currentIndex !== -1) {
                        const firstItem = scrollContainer.querySelector('.time-cell') as HTMLElement;
                        const cellWidth = firstItem ? firstItem.offsetWidth : 60;
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
    const cellWidthRef = React.useRef(50);
    const scrollTimeoutRef = React.useRef<number | null>(null);

    // Measure cell width on mount and resize
    React.useEffect(() => {
        const measureCellWidth = () => {
            if (scrollContainerRef.current) {
                const firstItem = scrollContainerRef.current.querySelector('.time-cell') as HTMLElement;
                if (firstItem) {
                    cellWidthRef.current = firstItem.offsetWidth;
                }
            }
        };

        measureCellWidth();
        window.addEventListener('resize', measureCellWidth);
        return () => window.removeEventListener('resize', measureCellWidth);
    }, [hourlyData]);

    const handleScroll = () => {
        if (scrollTimeoutRef.current) return;

        scrollTimeoutRef.current = requestAnimationFrame(() => {
            const scrollContainer = scrollContainerRef.current;
            if (!scrollContainer) {
                scrollTimeoutRef.current = null;
                return;
            }

            const cellWidth = cellWidthRef.current;
            const scrollLeft = scrollContainer.scrollLeft;
            const index = Math.floor((scrollLeft + 10) / cellWidth);

            if (allHours[index]) {
                const newDate = getLocalDate(allHours[index].time);
                if (newDate !== activeDate && onDateChange) {
                    onDateChange(newDate);
                }
            }
            scrollTimeoutRef.current = null;
        });
    };

    // Group hours by day for the header row
    const days = React.useMemo(() => {
        if (!allHours.length) return [];
        const groups: { date: string; hours: WeatherData[] }[] = [];
        let currentDay: { date: string; hours: WeatherData[] } | null = null;

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

    // Scroll active day tab into view
    React.useEffect(() => {
        if (navContainerRef.current && activeDate) {
            const activeTab = navContainerRef.current.querySelector('.day-nav-item.active');
            if (activeTab) {
                activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeDate]);

    const renderTooltip = (code: number) => (props: any) => (
        <Tooltip id={`tooltip-${code}`} {...props}>
            {getWeatherDescription(code, language)}
        </Tooltip>
    );

    const formatDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStr = today.toISOString().slice(0, 10);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);

        if (dateStr === todayStr) return t("today");
        if (dateStr === tomorrowStr) return t("tomorrow");

        const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
        return `${weekday} ${formatDate(dateStr)}`;
    };

    const scrollToDate = React.useCallback((date: string) => {
        if (onDateChange) onDateChange(date);
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer && allHours.length > 0) {
            const index = allHours.findIndex(h => h.time.startsWith(date));

            if (index !== -1) {
                const firstItem = scrollContainer.querySelector('.time-cell') as HTMLElement;
                const cellWidth = firstItem ? firstItem.offsetWidth : 60;
                const scrollPosition = index * cellWidth;

                scrollContainer.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
            }
        }
    }, [onDateChange, allHours]);

    // Handle Keyboard Navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            if (e.key === 'ArrowLeft') {
                const currentIndex = availableDates.indexOf(activeDate);
                if (currentIndex > 0) {
                    scrollToDate(availableDates[currentIndex - 1]);
                }
            } else if (e.key === 'ArrowRight') {
                const currentIndex = availableDates.indexOf(activeDate);
                if (currentIndex < availableDates.length - 1) {
                    scrollToDate(availableDates[currentIndex + 1]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [availableDates, activeDate, scrollToDate]);

    if (loading) return <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}><p>Loading hourly forecast...</p></Container>;
    if (error) return <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}><p>Error loading hourly forecast.</p></Container>;
    if (!hourlyData || hourlyData.length === 0) return <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}><p>No hourly data available.</p></Container>;

    return (
        <Container className="hourly-forecast-container p-0">
            <div className="day-navigation-bar mb-2" ref={navContainerRef}>
                {days.map(day => {
                    const dayData = dailyData.find(d => d.time === day.date);
                    const snowSum = dayData?.values?.snowfallSum || 0;

                    return (
                        <button
                            key={day.date}
                            className={`day-nav-item ${activeDate === day.date ? 'active' : ''}`}
                            onClick={() => scrollToDate(day.date)}
                        >
                            <div className="d-flex flex-column align-items-center">
                                <span>{formatDateLabel(day.date)}</span>
                                {snowSum > 0 && (
                                    <span style={{ fontSize: "0.75rem", color: "#aaddff", marginTop: "2px" }}>
                                        ❄️ {snowSum} cm
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div
                className="unified-forecast-scroll-container"
                ref={scrollContainerRef}
                onScroll={handleScroll}
            >
                <div
                    className="unified-forecast-grid"
                    style={{ '--total-hours': allHours.length } as React.CSSProperties}
                >
                    {/* Row 1: Hours */}
                    {allHours.map((hourData, i) => {
                        const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
                        const isPast = currentHourIso && hourData.time < currentHourIso;

                        return (
                            <div key={`time-${hourData.time}`} className={`grid-cell time-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                                {formatTime(hourData.time, { hourOnly: true })}
                            </div>
                        );
                    })}

                    {/* Row 3: Icons */}
                    {allHours.map((hourData, i) => {
                        const isDay = getIsDaytime(hourData.time);
                        const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
                        const isPast = currentHourIso && hourData.time < currentHourIso;

                        return (
                            <div key={`icon-${hourData.time}`} className={`grid-cell icon-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
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
                            <div key={`temp-${hourData.time}`} className={`grid-cell temp-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                                {getTemperature(hourData.values.temperature)}{unitLabels.temperature}
                            </div>
                        );
                    })}

                    {/* Row 5: Wind */}
                    {allHours.map((hourData, i) => {
                        const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
                        const isPast = currentHourIso && hourData.time < currentHourIso;

                        return (
                            <div key={`wind-${hourData.time}`} className={`grid-cell wind-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                                <div className="d-flex flex-column align-items-center">
                                    <span
                                        className="wind-arrow"
                                        style={{ transform: `rotate(${hourData.values.windDirection || 0}deg)` }}
                                    >
                                        ↓
                                    </span>
                                    <span className="wind-speed" style={{ fontSize: "0.8rem" }}>
                                        {getSpeed(hourData.values.windSpeed)} <span style={{ fontSize: "0.6rem" }}>{unitLabels.speed}</span>
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Row 6: Precipitation */}
                    {allHours.map((hourData, i) => {
                        const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
                        const isPast = currentHourIso && hourData.time < currentHourIso;
                        const amount = hourData.values.precipitation;
                        const snowAmount = hourData.values.snowfall || 0;

                        return (
                            <div key={`precip-${hourData.time}`} className={`grid-cell precip-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                                <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "100%" }}>
                                    {amount > 0 && snowAmount === 0 && (
                                        <span className="precip-amount" style={{ fontSize: "0.7rem", color: "#aaddff" }}>
                                            {getPrecip(amount)}{unitLabels.precip}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Row 7: Snowfall (Conditional) */}
                    {allHours.some(h => (h.values.snowfall || 0) > 0) && allHours.map((hourData, i) => {
                        const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
                        const isPast = currentHourIso && hourData.time < currentHourIso;
                        const amount = hourData.values.snowfall || 0;

                        return (
                            <div key={`snow-${hourData.time}`} className={`grid-cell snow-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                                <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "100%" }}>
                                    {amount > 0 && (
                                        <span className="snow-amount" style={{ fontSize: "0.7rem", color: "#ffffff" }}>
                                            {amount} cm
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chart Section */}
            {chart && (
                <div className="chart-container mt-3 mb-3">
                    {chart}
                </div>
            )}
        </Container>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    if (
        prevProps.loading !== nextProps.loading ||
        prevProps.error !== nextProps.error ||
        prevProps.timezone !== nextProps.timezone ||
        prevProps.darkMode !== nextProps.darkMode ||
        prevProps.activeDate !== nextProps.activeDate ||
        prevProps.chart !== nextProps.chart
    ) {
        return false;
    }

    if (prevProps.hourlyData === nextProps.hourlyData && prevProps.dailyData === nextProps.dailyData) {
        return true;
    }

    if (prevProps.hourlyData?.length !== nextProps.hourlyData?.length ||
        prevProps.dailyData?.length !== nextProps.dailyData?.length) {
        return false;
    }

    if (prevProps.hourlyData?.length > 0 && nextProps.hourlyData?.length > 0) {
        const prevFirst = prevProps.hourlyData[0];
        const nextFirst = nextProps.hourlyData[0];
        const prevLast = prevProps.hourlyData[prevProps.hourlyData.length - 1];
        const nextLast = nextProps.hourlyData[nextProps.hourlyData.length - 1];

        if (prevFirst?.time !== nextFirst?.time || prevLast?.time !== nextLast?.time) {
            return false;
        }
    }

    return true;
});

export default HourlyForecast;
