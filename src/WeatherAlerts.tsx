import React, { useState } from "react";
import { Alert, Badge } from "react-bootstrap";
import { WeatherAlert } from "./useWeatherAlerts";
import { useLanguage } from "./LanguageContext";

interface WeatherAlertsProps {
    alerts: WeatherAlert[];
    timezone: string;
}

const alertTranslations: Record<string, Record<string, { headline: string; description: string }>> = {
    en: {
        extreme_cold: { headline: "Extreme cold likely", description: "Forecast thresholds suggest dangerously cold temperatures." },
        strong_wind: { headline: "Strong wind likely", description: "Forecast thresholds suggest gusty wind conditions." },
        heavy_rain: { headline: "Heavy rain likely", description: "Forecast thresholds suggest heavy rainfall." },
        heavy_snow: { headline: "Heavy snow likely", description: "Forecast thresholds suggest heavy snowfall." },
        thunderstorm: { headline: "Thunderstorm likely", description: "Forecast thresholds suggest thunderstorm activity." },
    },
    fi: {
        extreme_cold: { headline: "Kova pakkanen mahdollinen", description: "Ennustekynnykset viittaavat erittäin kylmiin lämpötiloihin." },
        strong_wind: { headline: "Voimakas tuuli mahdollinen", description: "Ennustekynnykset viittaavat puuskaisiin tuuliin." },
        heavy_rain: { headline: "Runsas sade mahdollinen", description: "Ennustekynnykset viittaavat rankkasateeseen." },
        heavy_snow: { headline: "Runsas lumi mahdollinen", description: "Ennustekynnykset viittaavat runsaisiin lumisateisiin." },
        thunderstorm: { headline: "Ukkosmyrsky mahdollinen", description: "Ennustekynnykset viittaavat ukkosaktiivisuuteen." },
    },
};

const severityConfig: Record<string, { variant: string; icon: string }> = {
    Minor: { variant: "info", icon: "ℹ️" },
    Moderate: { variant: "warning", icon: "⚠️" },
    Severe: { variant: "danger", icon: "🟠" },
    Extreme: { variant: "danger", icon: "🔴" },
    Unknown: { variant: "secondary", icon: "❓" },
};

const formatAlertTime = (isoString: string, timezone: string, locale: string) => {
    try {
        const date = new Date(isoString);
        return date.toLocaleString(locale, {
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
    const { language, t } = useLanguage();
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
                const locale = language === "en" ? "en-US" : "fi-FI";

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
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <span aria-hidden="true">{config.icon}</span>
                                <strong>{headline}</strong>
                                <Badge bg="secondary">{t("forecastBasedRisk")}</Badge>
                            </div>
                            <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                {description} {t("forecastBasedRiskNote")} {formatAlertTime(alert.onset, timezone, locale)} → {formatAlertTime(alert.expires, timezone, locale)}
                            </div>
                        </div>
                    </Alert>
                );
            })}
        </div>
    );
};

export default WeatherAlerts;
