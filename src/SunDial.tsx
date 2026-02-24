import React from "react";
import { useUnits } from "./UnitContext";

interface SunDialProps {
    sunrise: string | null | undefined;
    sunset: string | null | undefined;
    timezone: string;
    isDay: boolean | number;
}

const SunDial: React.FC<SunDialProps> = ({ sunrise, sunset, timezone, isDay }) => {
    const { formatTime } = useUnits();

    if (!sunrise || !sunset) return null;

    // Parse times
    // Sunrise/Sunset from Open-Meteo are ISO strings (e.g., "2023-10-27T08:00")
    // We need to compare them with current time in the target timezone.

    // Let's get the current time in the target timezone as a string "YYYY-MM-DDTHH:mm" to match
    const getCurrentTimeInZone = () => {
        const formatter = new Intl.DateTimeFormat('sv-SE', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const parts = formatter.formatToParts(new Date());
        const year = parts.find(p => p.type === 'year')?.value;
        const month = parts.find(p => p.type === 'month')?.value;
        const day = parts.find(p => p.type === 'day')?.value;
        const hour = parts.find(p => p.type === 'hour')?.value;
        const minute = parts.find(p => p.type === 'minute')?.value;
        const second = parts.find(p => p.type === 'second')?.value;
        return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    };

    const nowStr = getCurrentTimeInZone();

    // Convert to timestamps (treating them as UTC to avoid timezone shifts during subtraction)
    const tSunrise = new Date(sunrise + "Z").getTime();
    const tSunset = new Date(sunset + "Z").getTime();
    const tNow = new Date(nowStr + "Z").getTime();

    let percentage = 0;

    if (tNow < tSunrise) {
        // Before sunrise
        percentage = 0;
    } else if (tNow > tSunset) {
        // After sunset
        percentage = 100;
    } else {
        // Daytime
        const totalDaylight = tSunset - tSunrise;
        const elapsed = tNow - tSunrise;
        percentage = (elapsed / totalDaylight) * 100;
    }

    // Clamp percentage
    percentage = Math.max(0, Math.min(100, percentage));

    // SVG Geometry
    // We want a semi-circle (180 degrees).
    // 0% = 180 degrees (left), 50% = 90 degrees (top), 100% = 0 degrees (right)
    // Wait, standard math: 0 deg is right. 180 is left.
    // So 0% -> 180 deg. 100% -> 0 deg.
    const angle = 180 - (percentage / 100) * 180;

    // Radius and Center
    const r = 40;
    const cx = 50;
    const cy = 50;

    // Calculate Sun Position
    const rad = (angle * Math.PI) / 180;
    const sunX = cx + r * Math.cos(rad);
    const sunY = cy - r * Math.sin(rad); // Y is inverted in SVG

    return (
        <div className="sun-dial-container" style={{ width: "100%", textAlign: "center", position: "relative" }}>
            <div style={{ position: "relative", height: "60px", overflow: "hidden" }}>
                <svg viewBox="0 0 100 60" width="100%" height="100%" preserveAspectRatio="xMidYMax">
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(255, 215, 0, 0.3)" />
                            <stop offset="100%" stopColor="rgba(255, 215, 0, 0)" />
                        </linearGradient>
                    </defs>

                    {/* Track (Dashed Arc) */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="rgba(0,0,0,0.25)"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="sun-dial-track"
                    />

                    {/* Sun Icon */}
                    {isDay && (
                        <g transform={`translate(${sunX}, ${sunY})`}>
                            <circle r="5" fill="#FFD700" filter="url(#glow)" />
                            <circle r="2" fill="#FFF" />
                        </g>
                    )}

                    {/* Glow Filter */}
                    <defs>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>

                {/* Horizon Line */}
                <div className="sun-dial-horizon" style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "10%",
                    right: "10%",
                    height: "1px",
                    background: "rgba(0,0,0,0.15)"
                }} />

                {/* Current Time Clock */}
                <div className="sun-dial-clock" style={{
                    position: "absolute",
                    top: "0",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    color: "rgba(0, 0, 0, 0.7)",
                    textShadow: "none",
                    background: "rgba(0,0,0,0.08)",
                    padding: "1px 6px",
                    borderRadius: "8px",
                    backdropFilter: "blur(1px)",
                    border: "1px solid rgba(0,0,0,0.08)"
                }}>
                    {formatTime(nowStr)}
                </div>
            </div>

            {/* Labels */}
            <div className="d-flex justify-content-between px-2" style={{ marginTop: "-10px", fontSize: "0.85rem", fontWeight: "500" }}>
                <div className="text-start">
                    <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>Sunrise</div>
                    <div>{formatTime(sunrise)}</div>
                </div>
                <div className="text-end">
                    <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>Sunset</div>
                    <div>{formatTime(sunset)}</div>
                </div>
            </div>
        </div>
    );
};

export default SunDial;
