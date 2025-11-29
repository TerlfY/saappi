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

        if (weatherCode === 0 || weatherCode === 1) {
            bgClass = isDay ? "bg-clear-day" : "bg-clear-night";
        } else if (weatherCode === 2 || weatherCode === 3) {
            bgClass = isDay ? "bg-cloudy-day" : "bg-cloudy-night";
        } else if (
            (weatherCode >= 51 && weatherCode <= 67) ||
            (weatherCode >= 80 && weatherCode <= 82)
        ) {
            bgClass = isDay ? "bg-rain-day" : "bg-rain-night";
        } else if (
            (weatherCode >= 71 && weatherCode <= 77) ||
            (weatherCode >= 85 && weatherCode <= 86)
        ) {
            bgClass = isDay ? "bg-snow-day" : "bg-snow-night";
        } else if (weatherCode === 45 || weatherCode === 48) {
            bgClass = isDay ? "bg-fog-day" : "bg-fog-night";
        } else if (weatherCode >= 95 && weatherCode <= 99) {
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
