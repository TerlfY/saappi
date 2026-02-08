import React from "react";
import { Container, Alert, OverlayTrigger, Tooltip, Button, ProgressBar } from "react-bootstrap";
import "./CurrentWeather.css";
import { getWeatherDescription } from "./weatherDescriptions";
import SkeletonWeather from "./SkeletonWeather";
import { getIcon } from "./WeatherIcons";
import useAirQuality from "./useAirQuality";
import SunDial from "./SunDial";
import { useUnits } from "./UnitContext";
import { useLanguage } from "./LanguageContext";
import { WeatherData, DailyForecast, Location } from "./types";

interface CurrentWeatherProps {
    weatherData: { values: WeatherData["values"] } | null;
    dailyValues: DailyForecast["values"] | null;
    loading: boolean;
    error: { message?: string } | null;
    cityName: string;
    timezone: string;
    darkMode: boolean;
    onLocationReset: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    location: Location | null;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({
    weatherData,
    dailyValues,
    loading,
    error,
    cityName,
    timezone,
    darkMode,
    onLocationReset,
    isFavorite,
    onToggleFavorite,
    location
}) => {
    const { data: aqiData } = useAirQuality(location);
    const { getTemperature, getSpeed, getPrecip, unitLabels } = useUnits();
    const { t, language } = useLanguage();

    // --- Rendering Logic ---

    // 1. Handle Loading State
    if (loading) {
        return (
            <Container
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100%" }}
            >
                <SkeletonWeather type="current" />
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
                    {error.message || t("error")}
                </Alert>
            </Container>
        );
    }

    // 3. Handle No Data/Initial State
    if (!weatherData?.values) {
        return (
            <Container
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100%" }}
            >
                <p>{t("loading")}</p>
            </Container>
        );
    }

    // Use isDay from API data
    const isDay = weatherData.values.isDay ?? 1;

    const renderTooltip = (props: any) => (
        <Tooltip id="button-tooltip" {...props}>
            {getWeatherDescription(weatherData.values.weatherCode, language)}
        </Tooltip>
    );

    return (
        <Container className="position-relative">
            <div className="weather-controls">
                <Button
                    variant="link"
                    onClick={onLocationReset}
                    className="control-btn"
                    title={t("useCurrentLocation")}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "80%", height: "80%" }}>
                        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                    </svg>
                </Button>
            </div>

            <div>
                <div className="d-flex justify-content-center align-items-center gap-2" style={{ paddingTop: "60px" }}>
                    <h2 className="text-truncate m-0" style={{ maxWidth: "80%" }} title={cityName}>
                        {cityName}
                    </h2>
                    <Button
                        variant="link"
                        onClick={onToggleFavorite}
                        className="p-0 text-decoration-none"
                        style={{ fontSize: "1.5rem", lineHeight: 1, color: isFavorite ? "#FFD700" : (darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)") }}
                        title={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
                    >
                        {isFavorite ? "★" : "☆"}
                    </Button>
                </div>
                <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                >
                    <img
                        className="mb-3 current-weather-icon"
                        style={{ height: "120px", width: "auto", objectFit: "contain" }}
                        src={getIcon(
                            weatherData.values.weatherCode,
                            isDay,
                            weatherData.values.cloudCover
                        )}
                        alt="Weather Icon"
                    />
                </OverlayTrigger>
                <p className="fs-1 fw-bold">{`${getTemperature(weatherData.values.temperature)}${unitLabels.temperature}`}</p>

                {/* Weather Details Grid */}
                <div className="weather-details-grid mt-4">
                    <div className="detail-item">
                        <span className="detail-label">{t("feelsLike")}</span>
                        <span className="detail-value">{getTemperature(weatherData.values.temperatureApparent || 0)}{unitLabels.temperature}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">{t("wind")}</span>
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip id="wind-tooltip">
                                    {t("gusts")}: {getSpeed(weatherData.values.windGusts || 0)} {unitLabels.speed}
                                </Tooltip>
                            }
                        >
                            <span className="detail-value" style={{ cursor: "help", textDecoration: "underline dotted" }}>
                                {getSpeed(weatherData.values.windSpeed)} {unitLabels.speed}
                            </span>
                        </OverlayTrigger>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">{t("humidity")}</span>
                        <span className="detail-value">{Math.round(weatherData.values.humidity)}%</span>
                    </div>
                    {weatherData.values.precipitation > 0 && (weatherData.values.snowfall || 0) === 0 && (
                        <div className="detail-item">
                            <span className="detail-label">{t("precip")}</span>
                            <span className="detail-value">{getPrecip(weatherData.values.precipitation)} {unitLabels.precip}</span>
                        </div>
                    )}
                    <div className="detail-item">
                        <span className="detail-label">{t("uvIndex")}</span>
                        <span className="detail-value">{weatherData.values.uvIndex}</span>
                    </div>
                    <div className="detail-item" style={{ gridColumn: "span 2", padding: "10px 0" }}>
                        <SunDial
                            sunrise={dailyValues?.sunriseTime}
                            sunset={dailyValues?.sunsetTime}
                            timezone={timezone}
                            isDay={isDay}
                        />
                    </div>

                    {/* Air Quality Meter */}
                    {aqiData?.current && (
                        <div className="detail-item" style={{ gridColumn: "span 2" }}>
                            {(() => {
                                const aqi = aqiData.current.european_aqi;
                                let status = t("aqi.good");
                                let color = "success";
                                if (aqi > 20) { status = t("aqi.fair"); color = "info"; }
                                if (aqi > 40) { status = t("aqi.moderate"); color = "warning"; }
                                if (aqi > 60) { status = t("aqi.poor"); color = "danger"; }
                                if (aqi > 80) { status = t("aqi.veryPoor"); color = "danger"; }
                                if (aqi > 100) { status = t("aqi.extremelyPoor"); color = "dark"; }

                                // Invert percentage: 0 AQI (Good) = 100% Bar, 100 AQI (Bad) = 0% Bar
                                const percentage = Math.max(0, 100 - aqi);

                                return (
                                    <>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="detail-label">{t("airQuality")}</span>
                                            <span className={`detail-value text-${color}`} style={{ fontSize: "0.9rem" }}>{status} ({aqi})</span>
                                        </div>
                                        <ProgressBar
                                            now={percentage}
                                            variant={color}
                                            style={{ height: "8px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.2)" }}
                                        />
                                    </>
                                );
                            })()}
                        </div>
                    )}
                    {(weatherData.values.snowDepth || 0) * 100 >= 1 && (
                        <div className="detail-item" style={{ gridColumn: "span 2" }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="detail-label">{t("snowDepth")}</span>
                                <span className="detail-value">{weatherData.values.snowDepth ? (weatherData.values.snowDepth * 100).toFixed(0) : 0} cm</span>
                            </div>
                            <div style={{ height: "8px", background: "rgba(255,255,255,0.2)", borderRadius: "4px", overflow: "hidden" }}>
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${Math.min(((weatherData.values.snowDepth || 0) * 100) / 50 * 100, 100)}%`,
                                        background: "#fff",
                                        borderRadius: "4px",
                                        transition: "width 0.5s ease-out"
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    {(weatherData.values.snowfall || 0) > 0 && (
                        <div className="detail-item" style={{ gridColumn: "span 2" }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="detail-label">{t("snowfall")}</span>
                                <span className="detail-value">{weatherData.values.snowfall} cm</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Container >
    );
};

export default CurrentWeather;
