import { useState, useEffect } from "react";

const useGeolocation = () => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ latitude, longitude });
                },
                (err) => {
                    console.error("Error getting current location:", err.message);
                    setError(err.message);
                }
            );
        } else {
            const msg = "Geolocation is not supported by your browser";
            console.error(msg);
            setError(msg);
        }
    }, []);

    return { currentLocation, error };
};

export default useGeolocation;
