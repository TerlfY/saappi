import React from "react";
import { Card, Spinner, Alert, Badge } from "react-bootstrap";
import useWebcams from "./useWebcams";

const WebcamFeed = ({ location, darkMode }) => {
    const { data: webcam, isLoading, error } = useWebcams(location);
    const apiKeyMissing = !import.meta.env.VITE_WINDY_API_KEY;

    if (apiKeyMissing) {
        // Don't render anything if no key is configured yet, 
        // or render a placeholder if you want to prompt the user in-UI.
        // For now, let's return null to keep it clean until configured.
        return null;
    }

    if (isLoading) {
        return (
            <Card className={`mb-4 ${darkMode ? "bg-dark text-white" : ""}`} style={{ minHeight: "200px" }}>
                <Card.Body className="d-flex justify-content-center align-items-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading webcam...</span>
                    </Spinner>
                </Card.Body>
            </Card>
        );
    }

    if (error || !webcam) {
        // Gracefully handle no webcam found
        return (
            <Card className={`mb-4 ${darkMode ? "bg-dark text-white" : ""}`}>
                <Card.Body className="text-center text-muted">
                    <p className="m-0">No live webcam found nearby.</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className={`mb-4 ${darkMode ? "bg-dark text-white" : ""} overflow-hidden`}>
            <div style={{ position: "relative" }}>
                <Card.Img
                    variant="top"
                    src={webcam.images.current.preview}
                    alt={webcam.title}
                    style={{ minHeight: "200px", objectFit: "cover" }}
                />
                <Badge
                    bg="danger"
                    style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        animation: "pulse 2s infinite"
                    }}
                >
                    LIVE
                </Badge>
                <div
                    style={{
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        right: "0",
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        padding: "5px 10px",
                        fontSize: "0.8rem"
                    }}
                >
                    {webcam.title} ({webcam.location.city}, {webcam.location.country})
                </div>
            </div>
            {/* Attribution required by Windy */}
            <Card.Footer className="text-end p-1" style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                Powered by <a href="https://www.windy.com/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>Windy.com</a>
            </Card.Footer>
        </Card>
    );
};

export default WebcamFeed;
