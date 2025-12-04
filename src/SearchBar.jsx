import React, { useRef, useEffect } from "react";
import { Form, Spinner } from "react-bootstrap";
import { formatLocationName } from "./utils";
import "./SearchBar.css";

const SearchBar = ({
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
    const inputRef = useRef(null);
    const timeoutRef = useRef(null);
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
        const handleGlobalKeyDown = (e) => {
            if (e.defaultPrevented) return; // Already handled
            if (document.activeElement === inputRef.current) {
                if (onKeyDown) onKeyDown(e);
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [onKeyDown]);

    // ...

    return (
        <div className="search-bar-container">
            <Form className="position-relative w-100" onSubmit={onSubmit}>
                <div className="search-input-wrapper">
                    {/* ... */}
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input form-control"
                        placeholder="Search city..."
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
                            <div className="dropdown-header px-3 py-2 text-muted small">Favorites</div>
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
