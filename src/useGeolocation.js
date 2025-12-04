import { useState, useEffect, useRef } from "react";

const useGeolocation = () => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [error, setError] = useState(null);

    const requestRef = useRef(false);

    useEffect(() => {
        if (requestRef.current) return;
        requestRef.current = true;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ latitude, longitude });
                },
                (err) => {
                    console.error("Error getting current location:", err.message);
                    setError(err.message);
                    requestRef.current = false; // Allow retry on error if component remounts? Or keep it true?
                    // Better to keep it true to avoid double error in strict mode too.
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
