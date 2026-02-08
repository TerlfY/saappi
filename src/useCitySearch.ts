import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { openMeteoGeocodingSchema, OpenMeteoGeocodingResponse } from "./schemas";
import useDebounce from "./useDebounce";
import { formatLocationName } from "./utils";
import { useLanguage } from "./LanguageContext";

interface SearchResult {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    elevation?: number;
    feature_code?: string;
    country_code?: string;
    timezone?: string;
    population?: number;
    country?: string;
    admin1?: string;
    admin2?: string;
    admin3?: string;
    admin4?: string;
}

export interface SearchedLocation {
    latitude: number;
    longitude: number;
    name: string;
}

const fetchCitySearch = async ({ queryKey }: { queryKey: [string, string] }): Promise<OpenMeteoGeocodingResponse> => {
    const [_, city] = queryKey;
    const response = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`
    );
    return openMeteoGeocodingSchema.parse(response.data);
};

const useCitySearch = () => {
    const { t } = useLanguage();
    const [searchCity, setSearchCity] = useState<string>("");
    const [searchedLocation, setSearchedLocation] = useState<SearchedLocation | null>(() => {
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
    const [searchError, setSearchError] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [selectionMade, setSelectionMade] = useState<boolean>(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

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
            setSearchError(t("cityNotFound"));
        }
    }, [searchResults, selectionMade, t]);

    // Handle errors from the query
    useEffect(() => {
        if (queryError) {
            console.error("Error searching for the city:", queryError);
            setSearchError(t("searchFailed"));
        }
    }, [queryError, t]);

    const handleSuggestionClick = (result: SearchResult) => {
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

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchCity(e.target.value);
        setSelectionMade(false);
        setHighlightedIndex(-1); // Reset highlight
        if (e.target.value === "") setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent, favorites?: SearchedLocation[]) => {
        // Handle Favorites Navigation (when search is empty)
        if (!searchCity && favorites && favorites.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < favorites.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (highlightedIndex >= 0 && favorites[highlightedIndex]) {
                    // We need to adapt the favorite to SearchResult structure or handle it separately
                    // Since handleSuggestionClick expects SearchResult, we might need a separate handler or cast
                    // But favorites are already SearchedLocation.
                    // Let's assume handleSuggestionClick can handle it or we set it directly.
                    // Actually handleSuggestionClick expects SearchResult which has more fields.
                    // But setSearchedLocation only needs lat/lon/name.
                    // So we can just call setSearchedLocation directly here.
                    setSearchedLocation(favorites[highlightedIndex]);
                    setSearchCity("");
                    setShowSuggestions(false);
                    setHighlightedIndex(-1);
                }
            } else if (e.key === "Escape") {
                setHighlightedIndex(-1);
                (e.target as HTMLElement).blur(); // Also blur on escape
            }
            return;
        }

        // Handle Search Results Navigation
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
            setHighlightedIndex(-1);
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
