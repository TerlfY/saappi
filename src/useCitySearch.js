import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { searchResultSchema } from "./schemas";
import useDebounce from "./useDebounce";
import { formatLocationName } from "./utils";

const fetchCitySearch = async ({ queryKey }) => {
    const [_, city] = queryKey;
    const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${city}&format=json&addressdetails=1`
    );
    return searchResultSchema.parse(response.data);
};

const useCitySearch = () => {
    const [searchCity, setSearchCity] = useState("");
    const [searchedLocation, setSearchedLocation] = useState(null);
    const [searchError, setSearchError] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectionMade, setSelectionMade] = useState(false);

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
            const seen = new Set();
            return data.filter((item) => {
                const name = formatLocationName(item.address) || item.display_name;
                if (seen.has(name)) {
                    return false;
                }
                seen.add(name);
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
        const formattedName = formatLocationName(result.address) || result.display_name;

        setSearchedLocation({
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            name: formattedName,
        });
        setSearchCity(formattedName);
        setShowSuggestions(false);
    };

    const handleSearchInputChange = (e) => {
        setSearchCity(e.target.value);
        setSelectionMade(false);
        if (e.target.value === "") setShowSuggestions(false);
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
    };
};

export default useCitySearch;
