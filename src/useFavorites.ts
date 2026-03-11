import { useState, useEffect } from "react";
import { SearchedLocation } from "./useCitySearch";
import {
    parsePersistedLocations,
    resolvePersistedLocations,
    serializePersistedLocations,
} from "./locationPersistence";

const useFavorites = () => {
    const [favorites, setFavorites] = useState<SearchedLocation[]>([]);
    const [hasLoadedStoredFavorites, setHasLoadedStoredFavorites] = useState(false);

    useEffect(() => {
        let isActive = true;

        const hydrateFavorites = async () => {
            try {
                const stored = localStorage.getItem("weatherFavorites");
                const persistedFavorites = parsePersistedLocations(stored);

                if (persistedFavorites.length === 0) return;

                const resolvedFavorites = await resolvePersistedLocations(persistedFavorites);
                if (isActive) {
                    setFavorites(resolvedFavorites);
                }
            } catch (e) {
                console.error("Error loading favorites:", e);
            } finally {
                if (isActive) {
                    setHasLoadedStoredFavorites(true);
                }
            }
        };

        hydrateFavorites();

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        if (!hasLoadedStoredFavorites) return;

        try {
            localStorage.setItem("weatherFavorites", serializePersistedLocations(favorites));
        } catch (e) {
            console.error("Error saving favorites:", e);
        }
    }, [favorites, hasLoadedStoredFavorites]);

    const addFavorite = (location: SearchedLocation) => {
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

    const removeFavorite = (location: SearchedLocation) => {
        if (!location) return;
        setFavorites((prev) => prev.filter(f =>
            !(Math.abs(f.latitude - location.latitude) < 0.001 &&
                Math.abs(f.longitude - location.longitude) < 0.001)
        ));
    };

    const isFavorite = (location: SearchedLocation | null) => {
        if (!location) return false;
        return favorites.some(f =>
            Math.abs(f.latitude - location.latitude) < 0.001 &&
            Math.abs(f.longitude - location.longitude) < 0.001
        );
    };

    return { favorites, addFavorite, removeFavorite, isFavorite };
};

export default useFavorites;
