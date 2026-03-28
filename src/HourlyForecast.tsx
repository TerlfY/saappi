import React from "react";
import { Container, OverlayTrigger, Tooltip } from "react-bootstrap";
import { getIcon } from "./WeatherIcons";
import { getWeatherDescription } from "./weatherDescriptions";
import "./HourlyForecast.css";
import useDraggableScroll from "./useDraggableScroll";
import { useUnits } from "./UnitContext";
import { useLanguage } from "./LanguageContext";
import { WeatherData, DailyForecast } from "./types";

const HOUR_CELL_WIDTH = 56;
const HORIZONTAL_SCROLL_STEP = HOUR_CELL_WIDTH * 6;

interface HourlyForecastProps {
    hourlyData: WeatherData[];
    dailyData: DailyForecast[];
    loading: boolean;
    error: unknown;
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
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(false);

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
    const effectiveActiveDate = activeDate || availableDates[0] || "";
    const visibleHours = React.useMemo(() => {
        if (!effectiveActiveDate) return [];
        return allHours.filter((hour) => getLocalDate(hour.time) === effectiveActiveDate);
    }, [allHours, effectiveActiveDate]);

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

    const updateScrollIndicators = React.useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, []);

    React.useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        const hasCurrentHourInView = currentHourIso
            ? visibleHours.findIndex((hour) => hour.time.startsWith(currentHourIso.slice(0, 13)))
            : -1;
        const targetScrollLeft = hasCurrentHourInView >= 0 ? hasCurrentHourInView * HOUR_CELL_WIDTH : 0;

        scrollContainer.scrollTo({
            left: targetScrollLeft,
            behavior: "smooth",
        });

        const animationFrame = requestAnimationFrame(updateScrollIndicators);
        return () => cancelAnimationFrame(animationFrame);
    }, [currentHourIso, effectiveActiveDate, updateScrollIndicators, visibleHours]);

    React.useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        updateScrollIndicators();

        const observer = new ResizeObserver(() => {
            updateScrollIndicators();
        });
        observer.observe(scrollContainer);

        return () => {
            observer.disconnect();
        };
    }, [updateScrollIndicators, visibleHours.length]);

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
        if (navContainerRef.current && effectiveActiveDate) {
            const activeTab = navContainerRef.current.querySelector('.day-nav-item.active');
            if (activeTab) {
                activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [effectiveActiveDate]);

    const renderTooltip = (code: number) => (props: any) => (
        <Tooltip id={`tooltip-${code}`} {...props}>
            {getWeatherDescription(code, language)}
        </Tooltip>
    );

    const formatWithSuffix = (value: string | number | null | undefined, suffix: string) => {
        if (value === null || value === undefined) return "—";
        return `${value} ${suffix}`;
    };

    const formatDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const formatter = new Intl.DateTimeFormat("sv-SE", {
            timeZone: timezone || undefined,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
        const todayStr = formatter.format(new Date());
        const tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const tomorrowStr = formatter.format(tomorrowDate);

        if (dateStr === todayStr) return t("today");
        if (dateStr === tomorrowStr) return t("tomorrow");

        const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
        return `${weekday} ${formatDate(dateStr)}`;
    };

    const scrollToDate = React.useCallback((date: string) => {
        if (onDateChange) onDateChange(date);
    }, [onDateChange]);

    // Handle Keyboard Navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            if (e.key === 'ArrowLeft') {
                const currentIndex = availableDates.indexOf(effectiveActiveDate);
                if (currentIndex > 0) {
                    scrollToDate(availableDates[currentIndex - 1]);
                }
            } else if (e.key === 'ArrowRight') {
                const currentIndex = availableDates.indexOf(effectiveActiveDate);
                if (currentIndex < availableDates.length - 1) {
                    scrollToDate(availableDates[currentIndex + 1]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [availableDates, effectiveActiveDate, scrollToDate]);

    if (loading) return <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}><p>{t("loading")}</p></Container>;
    if (error) return <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}><p>{t("hourlyDataUnavailable")}</p></Container>;
    if (!hourlyData || hourlyData.length === 0) return <Container className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}><p>{t("hourlyDataUnavailable")}</p></Container>;

    return (
        <Container className={`hourly-forecast-container p-0 ${darkMode ? "dark-mode" : ""}`}>
            <div className="day-navigation-bar mb-2" ref={navContainerRef}>
                {days.map(day => {
                    const dayData = dailyData.find(d => d.time === day.date);
                    const snowSum = dayData?.values?.snowfallSum || 0;

                    return (
                        <button
                            key={day.date}
                            className={`day-nav-item ${effectiveActiveDate === day.date ? 'active' : ''}`}
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
                className={`scroll-container-wrapper ${canScrollLeft ? 'can-scroll-left' : ''} ${canScrollRight ? 'can-scroll-right' : ''}`}
            >
                {canScrollLeft && (
                    <button
                        className="scroll-arrow scroll-arrow-left"
                        onClick={() => {
                            scrollContainerRef.current?.scrollBy({ left: -HORIZONTAL_SCROLL_STEP, behavior: 'smooth' });
                        }}
                        aria-label="Scroll left"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                )}
                {canScrollRight && (
                    <button
                        className="scroll-arrow scroll-arrow-right"
                        onClick={() => {
                            scrollContainerRef.current?.scrollBy({ left: HORIZONTAL_SCROLL_STEP, behavior: 'smooth' });
                        }}
                        aria-label="Scroll right"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                )}
                <div
                    className="unified-forecast-scroll-container"
                    ref={scrollContainerRef}
                    onScroll={updateScrollIndicators}
                >
                    <div
                        className="unified-forecast-grid"
                        style={{
                            '--total-hours': visibleHours.length,
                            '--hour-cell-width': `${HOUR_CELL_WIDTH}px`,
                        } as React.CSSProperties}
                    >
                        {/* Row 1: Hours */}
                        {visibleHours.map((hourData) => {
                            const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
                            const isPast = currentHourIso && hourData.time < currentHourIso;

                            return (
                                <div key={`time-${hourData.time}`} className={`grid-cell time-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                                    {formatTime(hourData.time, { hourOnly: true })}
                                </div>
                            );
                        })}

                        {/* Row 3: Icons */}
                        {visibleHours.map((hourData) => {
                            const isDay = getIsDaytime(hourData.time);
                            const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
                            const isPast = currentHourIso && hourData.time < currentHourIso;

                            return (
                                <div key={`icon-${hourData.time}`} className={`grid-cell icon-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                                    {hourData.values.weatherCode !== null && hourData.values.weatherCode !== undefined ? (
                                        <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={renderTooltip(hourData.values.weatherCode)}>
                                            <img
                                                className="hourlyIcons"
                                                src={getIcon(hourData.values.weatherCode, isDay, hourData.values.cloudCover)}
                                                alt="Weather Icon"
                                            />
                                        </OverlayTrigger>
                                    ) : (
                                        <span aria-label={t("hourlyDataUnavailable")}>—</span>
                                    )}
                                </div>
                            );
                        })}

                        {/* Row 3: Temperature */}
                        {visibleHours.map((hourData) => {
                            const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
                            const isPast = currentHourIso && hourData.time < currentHourIso;

                            return (
                                <div key={`temp-${hourData.time}`} className={`grid-cell temp-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                                    {formatWithSuffix(getTemperature(hourData.values.temperature), unitLabels.temperature)}
                                </div>
                            );
                        })}

                        {/* Row 4: Wind */}
                        {visibleHours.map((hourData) => {
                            const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
                            const isPast = currentHourIso && hourData.time < currentHourIso;

                            return (
                                <div key={`wind-${hourData.time}`} className={`grid-cell wind-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                                    <div className="d-flex flex-column align-items-center">
                                        <span
                                            className="wind-arrow"
                                            style={{ transform: `rotate(${hourData.values.windDirection ?? 0}deg)` }}
                                        >
                                            ↓
                                        </span>
                                        <span className="wind-speed" style={{ fontSize: "0.8rem" }}>
                                            {formatWithSuffix(getSpeed(hourData.values.windSpeed), unitLabels.speed)} <span style={{ fontSize: "0.6rem" }}>{unitLabels.speed}</span>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Row 5: Precipitation (Combined Prob & Amount) */}
                        {visibleHours.map((hourData) => {
                            const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
                            const isPast = currentHourIso && hourData.time < currentHourIso;
                            const amount = hourData.values.precipitation;
                            const prob = hourData.values.precipitationProbability;
                            const snowAmount = hourData.values.snowfall ?? 0;

                            return (
                                <div key={`precip-${hourData.time}`} className={`grid-cell precip-cell ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                                    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "100%", gap: "2px" }}>
                                        {amount !== null && amount !== undefined && amount > 0 && snowAmount === 0 ? (
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={(props) => (
                                                    <Tooltip id={`prob-tooltip-${hourData.time}`} {...props}>
                                                        💧 {prob ?? "—"}%
                                                    </Tooltip>
                                                )}
                                            >
                                                <span className="precip-amount" style={{ fontSize: "0.75rem", color: "#aaddff", fontWeight: 500, cursor: "help", borderBottom: (prob ?? 0) > 0 ? "1px dotted rgba(170, 221, 255, 0.5)" : "none" }}>
                                                    {formatWithSuffix(getPrecip(amount), unitLabels.precip)}
                                                </span>
                                            </OverlayTrigger>
                                        ) : (
                                            prob !== null && prob !== undefined && prob >= 20 && snowAmount === 0 && (
                                                <span className="precip-prob">💧{prob}%</span>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Row 6: Snowfall (Conditional) */}
                        {visibleHours.some(h => (h.values.snowfall ?? 0) > 0) && visibleHours.map((hourData) => {
                            const isCurrent = currentHourIso && hourData.time.startsWith(currentHourIso.slice(0, 13));
                            const isPast = currentHourIso && hourData.time < currentHourIso;
                            const amount = hourData.values.snowfall ?? 0;

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
