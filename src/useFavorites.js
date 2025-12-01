import { useState, useEffect } from "react";

const useFavorites = () => {
    const [favorites, setFavorites] = useState(() => {
        try {
            const stored = localStorage.getItem("weatherFavorites");
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Error loading favorites:", e);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("weatherFavorites", JSON.stringify(favorites));
        } catch (e) {
            console.error("Error saving favorites:", e);
        }
    }, [favorites]);

    const addFavorite = (location) => {
        if (!location) return;
        setFavorites((prev) => {
            // Avoid duplicates based on coordinates (fuzzy match)
            if (prev.some(f =>
                Math.abs(f.latitude - location.latitude) < 0.001 &&
                Math.abs(f.longitude - location.longitude) < 0.001
            )) {
                return prev;
            }
            return [...prev, location];
        });
    };

    const removeFavorite = (location) => {
        if (!location) return;
        setFavorites((prev) => prev.filter(f =>
            !(Math.abs(f.latitude - location.latitude) < 0.001 &&
                Math.abs(f.longitude - location.longitude) < 0.001)
        ));
    };

    const isFavorite = (location) => {
        if (!location) return false;
        return favorites.some(f =>
            Math.abs(f.latitude - location.latitude) < 0.001 &&
            Math.abs(f.longitude - location.longitude) < 0.001
        );
    };

    return { favorites, addFavorite, removeFavorite, isFavorite };
};

export default useFavorites;
