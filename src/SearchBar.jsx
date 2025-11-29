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
}) => {
    const inputRef = useRef(null);

    // Focus input on mount (optional, maybe annoying on mobile)
    // useEffect(() => {
    //   if (inputRef.current) {
    //     inputRef.current.focus();
    //   }
    // }, []);

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
                {showSuggestions && suggestions && suggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                        {suggestions.map((result, index) => (
                            <div
                                key={index}
                                className={`suggestion-item ${index === highlightedIndex ? "highlighted" : ""
                                    }`}
                                onClick={() => onSuggestionClick(result)}
                            >
                                {formatLocationName(result.address) || result.display_name}
                            </div>
                        ))}
                    </div>
                )}
            </Form>

            {/* Error Message */}
            {error && <div className="search-error">{error}</div>}
        </div>
    );
};

export default SearchBar;
