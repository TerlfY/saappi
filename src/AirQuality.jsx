import React from "react";
import { Card, Spinner, ProgressBar } from "react-bootstrap";
import useAirQuality from "./useAirQuality";

const AirQuality = ({ location, darkMode }) => {
    const { data, isLoading, error } = useAirQuality(location);

    if (isLoading) {
        return (
            <Card className={`mb-4 ${darkMode ? "bg-dark text-white" : ""}`} style={{ minHeight: "150px" }}>
                <Card.Body className="d-flex justify-content-center align-items-center">
                    <Spinner animation="border" size="sm" />
                </Card.Body>
            </Card>
        );
    }

    if (error || !data || !data.current) {
        return null; // Hide if no data
    }

    const aqi = data.current.european_aqi;

    // Determine status and color based on European AQI
    let status = "Good";
    let color = "success";
    let description = "Air quality is satisfactory.";

    if (aqi > 20) {
        status = "Fair";
        color = "info"; // Light blue/cyan
        description = "Air quality is acceptable.";
    }
    if (aqi > 40) {
        status = "Moderate";
        color = "warning"; // Yellow
        description = "Pollutants may affect sensitive individuals.";
    }
    if (aqi > 60) {
        status = "Poor";
        color = "danger"; // Red
        description = "Members of sensitive groups may experience health effects.";
    }
    if (aqi > 80) {
        status = "Very Poor";
        color = "danger"; // Darker red logic handled via style if needed, or just danger
        description = "Health warnings of emergency conditions.";
    }
    if (aqi > 100) {
        status = "Extremely Poor";
        color = "dark";
        description = "Health alert: everyone may experience more serious health effects.";
    }

    // Calculate percentage for progress bar (max 100 for visual scaling, though AQI can go higher)
    const percentage = Math.min((aqi / 100) * 100, 100);

    return (
        <Card className={`mb-4 ${darkMode ? "bg-dark text-white" : ""}`}>
            <Card.Body>
                <h5 className="card-title mb-3">Air Quality</h5>

                <div className="d-flex justify-content-between align-items-end mb-2">
                    <div>
                        <span className="display-6 fw-bold" style={{ color: `var(--bs-${color})` }}>{aqi}</span>
                        <span className="ms-2 text-muted small">AQI</span>
                    </div>
                    <div className={`text-${color} fw-bold`}>{status}</div>
                </div>

                <ProgressBar
                    now={percentage}
                    variant={color}
                    style={{ height: "10px", borderRadius: "5px", backgroundColor: "rgba(0,0,0,0.1)" }}
                />

                <p className="mt-3 mb-0 small opacity-75">
                    {description}
                </p>
            </Card.Body>
        </Card>
    );
};

export default AirQuality;
