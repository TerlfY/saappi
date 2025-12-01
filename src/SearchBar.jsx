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
    const [isFocused, setIsFocused] = React.useState(false);

    // ...

    return (
        <div className="search-bar-container">
            <Form className="position-relative w-100" onSubmit={onSubmit}>
                <div className="search-input-wrapper">
                    {/* Search Icon */}
                    <span className="search-icon">🔍</span>

                    {/* Input Field */}
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input form-control"
                        placeholder="Search city..."
                        value={value}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click
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
                                onClick={() => {
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
                                    className="suggestion-item"
                                    onClick={() => {
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
