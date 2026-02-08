import React, { useMemo } from 'react';
import './WeatherEffects.css';

interface WeatherEffectsProps {
    weatherCode: number | null | undefined;
}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({ weatherCode }) => {
    // Determine effect type based on weather code
    const effectType = useMemo(() => {
        if (weatherCode === undefined || weatherCode === null) return null;

        // Open-Meteo WMO Codes:
        // Rain: 51, 53, 55 (Drizzle), 61, 63, 65 (Rain), 80, 81, 82 (Showers)
        // Freezing Rain: 56, 57, 66, 67
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 56, 57, 66, 67].includes(weatherCode)) {
            return 'rain';
        }

        // Snow: 71, 73, 75 (Snowfall), 77 (Grains), 85, 86 (Showers)
        // Snow: 71, 73, 75 (Snowfall), 77 (Grains), 85, 86 (Showers)
        if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
            return 'snow';
        }

        // Thunderstorm: 95, 96, 99
        if ([95, 96, 99].includes(weatherCode)) {
            return 'thunder';
        }

        return null;
    }, [weatherCode]);

    // Generate particles
    const particles = useMemo(() => {
        if (!effectType) return []; // Handle null effectType inside hook

        const count = effectType === 'rain' ? 40 : effectType === 'snow' ? 50 : 0;
        const items: React.ReactNode[] = [];

        for (let i = 0; i < count; i++) {
            const style: React.CSSProperties = {
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 1 + 0.5}s`, // 0.5s - 1.5s
                animationDelay: `${Math.random() * 2}s`,
                opacity: Math.random(),
            };

            if (effectType === 'rain') {
                items.push(<div key={i} className="rain-drop" style={style} />);
            } else if (effectType === 'snow') {
                style.animationDuration = `${Math.random() * 3 + 2}s`; // Slower for snow
                style.fontSize = `${Math.random() * 10 + 10}px`;
                items.push(<div key={i} className="snowflake" style={style}>❄</div>);
            }
        }
        return items;
    }, [effectType]);

    if (!effectType) return null;

    return (
        <div className="weather-effects-container">
            {effectType === 'thunder' && <div className="thunder-flash" />}
            {particles}
        </div>
    );
};

export default WeatherEffects;
