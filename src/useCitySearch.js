import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { openMeteoGeocodingSchema } from "./schemas";
import useDebounce from "./useDebounce";
import { formatLocationName } from "./utils";

const fetchCitySearch = async ({ queryKey }) => {
    const [_, city] = queryKey;
    const response = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`
    );
    return openMeteoGeocodingSchema.parse(response.data);
};

const useCitySearch = () => {
    const [searchCity, setSearchCity] = useState("");
    const [searchedLocation, setSearchedLocation] = useState(() => {
        try {
            const stored = localStorage.getItem("weatherApp_searchedLocation");
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error("Error loading location from localStorage:", error);
            return null;
        }
    });

    // Persist searchedLocation to localStorage
    useEffect(() => {
        try {
            if (searchedLocation) {
                localStorage.setItem("weatherApp_searchedLocation", JSON.stringify(searchedLocation));
            } else {
                localStorage.removeItem("weatherApp_searchedLocation");
            }
        } catch (error) {
            console.error("Error saving location to localStorage:", error);
        }
    }, [searchedLocation]);
    const [searchError, setSearchError] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectionMade, setSelectionMade] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const debouncedSearchCity = useDebounce(searchCity, 500);

    const {
        data: searchResults,
        isFetching: searchLoading,
        error: queryError,
    } = useQuery({
        queryKey: ["search", debouncedSearchCity],
        queryFn: fetchCitySearch,
        enabled: !!debouncedSearchCity,
        retry: false,
        select: (data) => {
            if (!data.results) return [];
            const seen = new Set();
            return data.results.filter((item) => {
                const name = formatLocationName(item);
                // Create a unique key based on name and coordinates (rounded to 2 decimals for rough equality)
                const key = `${name}-${item.latitude.toFixed(2)}-${item.longitude.toFixed(2)}`;

                if (seen.has(key)) {
                    return false;
                }
                seen.add(key);
                return true;
            });
        },
    });

    // Show suggestions when results come in
    useEffect(() => {
        if (selectionMade) return;

        if (searchResults && searchResults.length > 0) {
            setShowSuggestions(true);
            setSearchError(null);
            setHighlightedIndex(-1); // Reset highlight when results change
        } else if (searchResults && searchResults.length === 0) {
            setShowSuggestions(false);
            setSearchError("City not found.");
        }
    }, [searchResults, selectionMade]);

    // Handle errors from the query
    useEffect(() => {
        if (queryError) {
            console.error("Error searching for the city:", queryError);
            setSearchError("City search failed. Please try again.");
        }
    }, [queryError]);

    const handleSuggestionClick = (result) => {
        setSelectionMade(true);
        const formattedName = formatLocationName(result);

        setSearchedLocation({
            latitude: result.latitude,
            longitude: result.longitude,
            name: formattedName,
        });
        setSearchCity("");
        setShowSuggestions(false);
        setHighlightedIndex(-1);
    };

    const handleSearchInputChange = (e) => {
        setSearchCity(e.target.value);
        setSelectionMade(false);
        if (e.target.value === "") setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (!showSuggestions || !searchResults) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev < searchResults.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
                handleSuggestionClick(searchResults[highlightedIndex]);
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
        }
    };

    return {
        searchCity,
        setSearchCity,
        searchedLocation,
        setSearchedLocation,
        searchError,
        setSearchError,
        showSuggestions,
        setShowSuggestions,
        searchResults,
        searchLoading,
        handleSuggestionClick,
        handleSearchInputChange,
        handleKeyDown,
        highlightedIndex,
    };
};

export default useCitySearch;
