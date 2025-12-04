import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

interface UnitContextType {
    unit: "metric" | "imperial";
    toggleUnit: () => void;
    getTemperature: (celsius: number, decimals?: number) => number;
    getSpeed: (ms: number) => number;
    getPrecip: (mm: number) => string;
    formatDate: (dateStr: string, options?: { includeYear?: boolean }) => string;
    formatTime: (dateInput: string | Date, options?: { hourOnly?: boolean }) => string;
    unitLabels: {
        temperature: string;
        speed: string;
        precip: string;
    };
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const useUnits = () => {
    const context = useContext(UnitContext);
    if (!context) {
        throw new Error("useUnits must be used within a UnitProvider");
    }
    return context;
};

interface UnitProviderProps {
    children: ReactNode;
}

export const UnitProvider: React.FC<UnitProviderProps> = ({ children }) => {
    const [unit, setUnit] = useState<"metric" | "imperial">(() => {
        try {
            return (localStorage.getItem("weatherApp_unit") as "metric" | "imperial") || "metric";
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

    const getTemperature = (celsius: number, decimals = 0) => {
        let value = celsius;
        if (unit === "imperial") {
            value = (celsius * 9) / 5 + 32;
        }

        if (decimals > 0) {
            return parseFloat(value.toFixed(decimals));
        }
        return Math.round(value);
    };

    const getSpeed = (ms: number) => {
        if (unit === "imperial") {
            // m/s to mph
            return Math.round(ms * 2.23694);
        }
        // m/s
        return Math.round(ms);
    };

    const getPrecip = (mm: number) => {
        if (unit === "imperial") {
            // mm to inches
            return (mm / 25.4).toFixed(2);
        }
        return mm.toFixed(1); // Keep 1 decimal for mm
    };

    const formatDate = (dateStr: string, options: { includeYear?: boolean } = {}) => {
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

    const formatTime = (dateInput: string | Date, options: { hourOnly?: boolean } = {}) => {
        const date = new Date(dateInput);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: options.hourOnly ? undefined : '2-digit',
            hour12: unit === "imperial",
            hourCycle: unit === "imperial" ? 'h12' : 'h23'
        });
    };

    const unitLabels = {
        temperature: unit === "metric" ? "°C" : "°F",
        speed: unit === "metric" ? "m/s" : "mph",
        precip: unit === "metric" ? "mm" : "in",
    };

    const contextValue = React.useMemo(() => ({
        unit,
        toggleUnit,
        getTemperature,
        getSpeed,
        getPrecip,
        formatDate,
        formatTime,
        unitLabels
    }), [unit]);

    return (
        <UnitContext.Provider value={contextValue}>
            {children}
        </UnitContext.Provider>
    );
};
