import React, { useState } from "react";
import { Alert } from "react-bootstrap";
import { WeatherAlert } from "./useWeatherAlerts";
import { useLanguage } from "./LanguageContext";

interface WeatherAlertsProps {
    alerts: WeatherAlert[];
    timezone: string;
}

const alertTranslations: Record<string, Record<string, { headline: string; description: string }>> = {
    en: {
        extreme_cold: { headline: "🥶 Extreme Cold Warning", description: "Dangerously cold temperatures expected." },
        strong_wind: { headline: "💨 Strong Wind Warning", description: "Strong wind gusts expected." },
        heavy_rain: { headline: "🌧️ Heavy Rain Warning", description: "Heavy rainfall expected." },
        heavy_snow: { headline: "❄️ Heavy Snow Warning", description: "Heavy snowfall expected." },
        thunderstorm: { headline: "⛈️ Thunderstorm Warning", description: "Thunderstorm activity expected." },
    },
    fi: {
        extreme_cold: { headline: "🥶 Ankaran pakkasen varoitus", description: "Vaarallisen kylmiä lämpötiloja odotettavissa." },
        strong_wind: { headline: "💨 Kovien tuulien varoitus", description: "Voimakkaita tuulenpuuskia odotettavissa." },
        heavy_rain: { headline: "🌧️ Rankkasadevaroitus", description: "Runsasta sadetta odotettavissa." },
        heavy_snow: { headline: "❄️ Lumisadevaroitus", description: "Runsasta lumisadetta odotettavissa." },
        thunderstorm: { headline: "⛈️ Ukkosmyrskyvaroitus", description: "Ukkosrintamia odotettavissa." },
    },
};

const severityConfig: Record<string, { variant: string; icon: string }> = {
    Minor: { variant: "info", icon: "ℹ️" },
    Moderate: { variant: "warning", icon: "⚠️" },
    Severe: { variant: "danger", icon: "🟠" },
    Extreme: { variant: "danger", icon: "🔴" },
    Unknown: { variant: "secondary", icon: "❓" },
};

const formatAlertTime = (isoString: string, timezone: string) => {
    try {
        const date = new Date(isoString);
        return date.toLocaleString("fi-FI", {
            timeZone: timezone || "Europe/Helsinki",
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return isoString;
    }
};

const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ alerts, timezone }) => {
    const { language } = useLanguage();
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    if (!alerts || alerts.length === 0) return null;

    const visibleAlerts = alerts.filter(a => !dismissed.has(a.id));
    if (visibleAlerts.length === 0) return null;

    const handleDismiss = (id: string) => {
        setDismissed(prev => new Set(prev).add(id));
    };

    return (
        <div className="weather-alerts-container mb-3">
            {visibleAlerts.map(alert => {
                const config = severityConfig[alert.severity] || severityConfig.Unknown;
                const trans = alertTranslations[language]?.[alert.event] || alertTranslations.en[alert.event];
                const headline = trans?.headline || alert.event;
                const description = trans?.description || "";

                return (
                    <Alert
                        key={alert.id}
                        variant={config.variant}
                        dismissible
                        onClose={() => handleDismiss(alert.id)}
                        className="d-flex align-items-start gap-2 mb-2"
                        style={{
                            backdropFilter: "blur(10px)",
                            borderRadius: "12px",
                            fontSize: "0.9rem",
                            animation: "slideDown 0.3s ease-out",
                        }}
                    >
                        <div className="flex-grow-1">
                            <strong>{headline}</strong>
                            <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                {description} {formatAlertTime(alert.onset, timezone)} → {formatAlertTime(alert.expires, timezone)}
                            </div>
                        </div>
                    </Alert>
                );
            })}
        </div>
    );
};

export default WeatherAlerts;
