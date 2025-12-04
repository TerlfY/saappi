import React, { useRef, useEffect } from "react";
import { Form, Spinner } from "react-bootstrap";
import { formatLocationName } from "./utils";
import "./SearchBar.css";
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

interface SearchedLocation {
    latitude: number;
    longitude: number;
    name: string;
}

interface SearchBarProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClear: () => void;
    suggestions: SearchResult[];
    onSuggestionClick: (result: SearchResult) => void;
    loading: boolean;
    error: string | null;
    highlightedIndex: number;
    onKeyDown: (e: React.KeyboardEvent) => void;
    showSuggestions: boolean;
    favorites: SearchedLocation[];
    onFavoriteSelect: (fav: SearchedLocation) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    onSubmit,
    onClear,
    suggestions,
    onSuggestionClick,
    loading,
    error,
    highlightedIndex,
    onKeyDown,
    showSuggestions,
    favorites,
    onFavoriteSelect,
}) => {
    const { t } = useLanguage();
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsFocused(true);
    };

    const handleBlur = () => {
        timeoutRef.current = setTimeout(() => setIsFocused(false), 200);
    };

    // Global listener workaround for missing input events
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.defaultPrevented) return; // Already handled
            if (document.activeElement === inputRef.current) {
                if (onKeyDown) onKeyDown(e as unknown as React.KeyboardEvent);
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [onKeyDown]);

    return (
        <div className="search-bar-container">
            <Form className="position-relative w-100" onSubmit={onSubmit}>
                <div className="search-input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input form-control"
                        placeholder={t("searchPlaceholder")}
                        value={value}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        aria-label="Search City"
                    />

                    {/* Right Action (Spinner or Clear Button) */}
                    <div className="search-action">
                        {loading ? (
                            <Spinner animation="border" size="sm" variant="secondary" />
                        ) : value ? (
                            <button
                                type="button"
                                className="clear-button"
                                onClick={() => {
                                    onClear();
                                    inputRef.current?.focus();
                                }}
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions && suggestions.length > 0 ? (
                    <div className="suggestions-dropdown">
                        {suggestions.map((result, index) => (
                            <div
                                key={index}
                                className={`suggestion-item ${index === highlightedIndex ? "highlighted" : ""
                                    }`}
                                onMouseDown={() => {
                                    onSuggestionClick(result);
                                    setIsFocused(false);
                                    inputRef.current?.blur();
                                }}
                            >
                                {formatLocationName(result)}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Favorites Dropdown */
                    isFocused && !value && favorites && favorites.length > 0 && (
                        <div className="suggestions-dropdown">
                            <div className="dropdown-header px-3 py-2 text-muted small">{t("favorites")}</div>
                            {favorites.map((fav, index) => (
                                <div
                                    key={`fav-${index}`}
                                    className={`suggestion-item ${index === highlightedIndex ? "highlighted" : ""}`}
                                    onMouseDown={() => {
                                        onFavoriteSelect(fav);
                                        setIsFocused(false);
                                        inputRef.current?.blur();
                                    }}
                                >
                                    <span className="me-2">★</span>
                                    {fav.name}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </Form>

            {/* Error Message */}
            {error && <div className="search-error">{error}</div>}
        </div>
    );
};

export default SearchBar;
