import React from "react";
import { Card, Spinner, Alert, Badge } from "react-bootstrap";
import useWebcams from "./useWebcams";

const WebcamFeed = ({ location, darkMode, timezone }) => {
    const { data: webcams, isLoading, error } = useWebcams(location);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const apiKeyMissing = !import.meta.env.VITE_WINDY_API_KEY;

    // Reset index when location changes
    React.useEffect(() => {
        setCurrentIndex(0);
    }, [location]);

    if (apiKeyMissing) return null;

    if (isLoading) {
        return (
            <Card id="webcam-section" className={`mb-4 ${darkMode ? "bg-dark text-white" : ""}`} style={{ minHeight: "200px" }}>
                <Card.Body className="d-flex justify-content-center align-items-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading webcams...</span>
                    </Spinner>
                </Card.Body>
            </Card>
        );
    }

    if (error || !webcams || webcams.length === 0) {
        return null;
    }

    const currentWebcam = webcams[currentIndex];
    const hasMultiple = webcams.length > 1;

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % webcams.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + webcams.length) % webcams.length);
    };

    return (
        <Card id="webcam-section" className={`mb-4 ${darkMode ? "bg-dark text-white" : ""} overflow-hidden`}>
            <div style={{ position: "relative" }}>
                <Card.Img
                    variant="top"
                    src={currentWebcam.images.current.preview}
                    alt={currentWebcam.title}
                    style={{ minHeight: "200px", objectFit: "cover" }}
                />

                <Badge
                    bg="danger"
                    style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        animation: "pulse 2s infinite",
                        zIndex: 2
                    }}
                >
                    LIVE
                </Badge>

                {/* Navigation Controls */}
                {hasMultiple && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="webcam-nav-btn prev"
                            style={{ left: "10px" }}
                            aria-label="Previous webcam"
                        >
                            &#10094;
                        </button>
                        <button
                            onClick={handleNext}
                            className="webcam-nav-btn next"
                            style={{ right: "10px" }}
                            aria-label="Next webcam"
                        >
                            &#10095;
                        </button>
                        <Badge
                            bg="dark"
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                opacity: 0.8,
                                zIndex: 2
                            }}
                        >
                            {currentIndex + 1} / {webcams.length}
                        </Badge>
                    </>
                )}

                <div
                    style={{
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        right: "0",
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        padding: "5px 10px",
                        fontSize: "0.8rem",
                        zIndex: 2
                    }}
                >
                    <div className="text-truncate fw-bold">{currentWebcam.title}</div>
                    <div className="d-flex justify-content-between align-items-center">
                        <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                            {currentWebcam.location.city}, {currentWebcam.location.country}
                        </span>
                        <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                            {new Date(currentWebcam.lastUpdatedOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: timezone })}
                        </span>
                    </div>
                </div>
            </div>
            <Card.Footer className="text-end p-1" style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                Powered by <a href="https://www.windy.com/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>Windy.com</a>
            </Card.Footer>
        </Card>
    );
};

export default WebcamFeed;
