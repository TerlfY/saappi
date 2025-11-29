import { useEffect } from "react";

const BackgroundManager = ({ weatherCode, isDay = true }) => {
    useEffect(() => {
        const body = document.body;
        // Remove all existing bg classes
        body.classList.remove(
            "bg-clear-day",
            "bg-clear-night",
            "bg-cloudy-day",
            "bg-cloudy-night",
            "bg-rain-day",
            "bg-rain-night",
            "bg-snow-day",
            "bg-snow-night",
            "bg-fog-day",
            "bg-fog-night",
            "bg-thunder-day",
            "bg-thunder-night"
        );

        if (!weatherCode) return;

        let bgClass = "bg-clear-day"; // Default

        // Logic to determine background class
        // Codes:
        // 1000: Clear
        // 1100-1102: Cloudy/Partly Cloudy
        // 4000-4201: Rain
        // 5000-5101: Snow
        // 2000-2100: Fog
        // 8000: Thunderstorm

        if (weatherCode === 1000 || weatherCode === 1100) {
            bgClass = isDay ? "bg-clear-day" : "bg-clear-night";
        } else if (weatherCode === 1001 || weatherCode === 1101 || weatherCode === 1102) {
            bgClass = isDay ? "bg-cloudy-day" : "bg-cloudy-night";
        } else if (weatherCode >= 4000 && weatherCode <= 4201) {
            bgClass = isDay ? "bg-rain-day" : "bg-rain-night";
        } else if (weatherCode >= 5000 && weatherCode <= 5101) {
            bgClass = isDay ? "bg-snow-day" : "bg-snow-night";
        } else if (weatherCode >= 6000 && weatherCode <= 7102) {
            bgClass = isDay ? "bg-snow-day" : "bg-snow-night"; // Treat freezing rain/ice as snow/cold
        } else if (weatherCode >= 2000 && weatherCode <= 2100) {
            bgClass = isDay ? "bg-fog-day" : "bg-fog-night";
        } else if (weatherCode === 8000) {
            bgClass = isDay ? "bg-thunder-day" : "bg-thunder-night";
        }

        body.classList.add(bgClass);

        return () => {
            body.classList.remove(bgClass);
        };
    }, [weatherCode, isDay]);

    return null; // This component doesn't render anything visible
};

export default BackgroundManager;
