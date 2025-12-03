import React, { createContext, useState, useContext, useEffect } from "react";

const UnitContext = createContext();

export const useUnits = () => useContext(UnitContext);

export const UnitProvider = ({ children }) => {
    const [unit, setUnit] = useState(() => {
        try {
            return localStorage.getItem("weatherApp_unit") || "metric";
        } catch (e) {
            return "metric";
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("weatherApp_unit", unit);
        } catch (e) {
            console.error("Failed to save unit to localStorage", e);
        }
    }, [unit]);

    const toggleUnit = () => {
        setUnit((prev) => (prev === "metric" ? "imperial" : "metric"));
    };

    const getTemperature = (celsius, decimals = 0) => {
        let value = celsius;
        if (unit === "imperial") {
            value = (celsius * 9) / 5 + 32;
        }

        if (decimals > 0) {
            return parseFloat(value.toFixed(decimals));
        }
        return Math.round(value);
    };

    const getSpeed = (ms) => {
        if (unit === "imperial") {
            // m/s to mph
            return Math.round(ms * 2.23694);
        }
        // m/s
        return Math.round(ms);
    };

    const getPrecip = (mm) => {
        if (unit === "imperial") {
            // mm to inches
            return (mm / 25.4).toFixed(2);
        }
        return mm.toFixed(1); // Keep 1 decimal for mm
    };

    const formatDate = (dateStr, options = {}) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        if (unit === "imperial") {
            if (options.includeYear) return `${month}/${day}/${year}`;
            return `${month}/${day}`;
        }
        // Metric
        if (options.includeYear) return `${day}.${month}.${year}`;
        return `${day}.${month}.`;
    };

    const unitLabels = {
        temperature: unit === "metric" ? "°C" : "°F",
        speed: unit === "metric" ? "m/s" : "mph",
        precip: unit === "metric" ? "mm" : "in",
    };

    return (
        <UnitContext.Provider
            value={{ unit, toggleUnit, getTemperature, getSpeed, getPrecip, formatDate, unitLabels }}
        >
            {children}
        </UnitContext.Provider>
    );
};
