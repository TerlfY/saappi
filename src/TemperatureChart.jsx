import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { useState } from "react";
import { Form } from "react-bootstrap";
import { useUnits } from "./UnitContext";

const TemperatureChart = ({ data, darkMode, timezone, showAllDays, onToggleShowAllDays }) => {
    const { getTemperature, getSpeed, unitLabels, unit, formatDate } = useUnits();
    const [visibleSeries, setVisibleSeries] = useState({ temp: true, uv: false, pop: false, wind: false });

    // Format data for Recharts
    const chartData = data.map((hour) => {
        // Parse hour directly from ISO string "YYYY-MM-DDTHH:MM"
        const dateObj = new Date(hour.time);
        const hourStr = hour.time.split("T")[1].slice(0, 2);
        const hourInt = parseInt(hourStr, 10);

        // Format label for X-axis
        let timeLabel;
        if (showAllDays) {
            // For 16-day view, use date (e.g., "1.12")
            const day = dateObj.getDate();
            const month = dateObj.getMonth() + 1;
            timeLabel = `${day}.${month}.`;
            // Only show label for noon or midnight to avoid clutter? 
            // Or just pass the full date string and let tickFormatter handle it
            timeLabel = hour.time;
        } else {
            timeLabel = hourInt;
        }

        return {
            time: showAllDays ? hour.time : hourInt, // Use full ISO string for all days to track unique points
            displayTime: showAllDays ? `${formatDate(hour.time)} ${hourInt}:00` : `${hourInt}:00`,
            fullTime: `${formatDate(hour.time, { includeYear: true })} ${hourInt}:00`, // For tooltip
            temp: getTemperature(hour.values.temperature, 1),
            uvIndex: hour.values.uvIndex || 0,
            pop: hour.values.precipitationProbability || 0,
            windSpeed: getSpeed(hour.values.windSpeed) || 0,
        };
    });

    // ... (keep existing currentHour logic) ...
    // Calculate current hour in the target timezone
    let currentHour = null;

    // Check if the data belongs to "today"
    const isToday = !showAllDays && data.length > 0 && (() => {
        const dataDate = data[0].time.slice(0, 10);
        let todayDate = new Date().toISOString().slice(0, 10);

        if (timezone) {
            try {
                const formatter = new Intl.DateTimeFormat('sv-SE', {
                    timeZone: timezone,
                    year: 'numeric', month: '2-digit', day: '2-digit'
                });
                const parts = formatter.formatToParts(new Date());
                const year = parts.find(p => p.type === 'year')?.value;
                const month = parts.find(p => p.type === 'month')?.value;
                const day = parts.find(p => p.type === 'day')?.value;
                todayDate = `${year}-${month}-${day}`;
            } catch (e) {
                console.error("Error formatting today date:", e);
            }
        }
        return dataDate === todayDate;
    })();

    if (isToday) {
        if (timezone) {
            try {
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: timezone,
                    hour: 'numeric',
                    hour12: false
                });
                const hourStr = formatter.format(new Date());
                // Handle "24" as "0" if necessary, but usually it returns 0-23
                currentHour = parseInt(hourStr, 10);
                if (currentHour === 24) currentHour = 0;
            } catch (e) {
                console.error("Error calculating chart current hour:", e);
            }
        } else {
            currentHour = new Date().getHours();
        }
    }

    // ... (keep existing gradient logic) ...
    // Calculate min and max for gradient offset
    const temps = chartData.map(d => d.temp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const freezingPoint = unit === "imperial" ? 32 : 0;

    const gradientOffset = () => {
        if (max <= freezingPoint) return 0;
        if (min >= freezingPoint) return 1;
        return (max - freezingPoint) / (max - min);
    };

    const off = gradientOffset();

    const axisColor = darkMode ? "#ccc" : "#888";
    const gridColor = darkMode ? "#555" : "#ccc";
    const tooltipText = darkMode ? "#fff" : "#000";
    const referenceLineColor = darkMode ? "#ff4d4d" : "#ff0000"; // Red for visibility

    // Custom tick formatter for X-axis
    const formatXAxis = (tickItem) => {
        if (showAllDays) {
            // tickItem is ISO string
            const date = new Date(tickItem);
            const hour = date.getHours();
            // Show date label only at noon (12:00) to reduce clutter
            if (hour === 12) {
                return formatDate(tickItem);
            }
            return "";
        }
        return tickItem;
    };

    return (
        <div style={{ width: "100%", height: 300, minWidth: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-2 px-2 flex-wrap">
                {/* Zoom Toggle */}
                <Form.Check
                    type="switch"
                    id="zoom-switch"
                    label={showAllDays ? "16 Days" : "1 Day"}
                    checked={showAllDays}
                    onChange={onToggleShowAllDays}
                    style={{ color: darkMode ? "#ccc" : "#333", fontSize: "0.9rem", fontWeight: "bold" }}
                />

                <div className="d-flex gap-3 flex-wrap">
                    <Form.Check
                        type="switch"
                        id="temp-switch"
                        label="Temp"
                        checked={visibleSeries.temp}
                        onChange={(e) => setVisibleSeries(prev => ({ ...prev, temp: e.target.checked }))}
                        style={{ color: darkMode ? "#ccc" : "#333", fontSize: "0.9rem" }}
                    />
                    <Form.Check
                        type="switch"
                        id="pop-switch"
                        label="Rain"
                        checked={visibleSeries.pop}
                        onChange={(e) => setVisibleSeries(prev => ({ ...prev, pop: e.target.checked }))}
                        style={{ color: darkMode ? "#ccc" : "#333", fontSize: "0.9rem" }}
                    />
                    <Form.Check
                        type="switch"
                        id="wind-switch"
                        label="Wind"
                        checked={visibleSeries.wind}
                        onChange={(e) => setVisibleSeries(prev => ({ ...prev, wind: e.target.checked }))}
                        style={{ color: darkMode ? "#ccc" : "#333", fontSize: "0.9rem" }}
                    />
                    <Form.Check
                        type="switch"
                        id="uv-switch"
                        label="UV"
                        checked={visibleSeries.uv}
                        onChange={(e) => setVisibleSeries(prev => ({ ...prev, uv: e.target.checked }))}
                        style={{ color: darkMode ? "#ccc" : "#333", fontSize: "0.9rem" }}
                    />
                </div>
            </div>
            <ResponsiveContainer debounce={50} minWidth={0}>
                <ComposedChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset={off} stopColor="#ff7300" stopOpacity={1} />
                            <stop offset={off} stopColor="#2F80ED" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="splitFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset={0} stopColor="#ff7300" stopOpacity={0.8} />
                            <stop offset={off} stopColor="#ff7300" stopOpacity={0.1} />
                            <stop offset={off} stopColor="#2F80ED" stopOpacity={0.1} />
                            <stop offset={1} stopColor="#2F80ED" stopOpacity={0.8} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} opacity={0.3} />
                    <XAxis
                        dataKey="time"
                        stroke={axisColor}
                        tick={{ fontSize: 12, fill: axisColor }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatXAxis}
                        interval={showAllDays ? 11 : 0} // Show fewer ticks in 16-day view
                    />
                    {visibleSeries.temp && (
                        <YAxis
                            yAxisId="left"
                            hide
                            domain={['dataMin - 2', 'dataMax + 2']}
                        />
                    )}
                    {visibleSeries.pop && (
                        <YAxis
                            yAxisId="right_pop"
                            orientation="right"
                            domain={[0, 100]}
                            hide
                        />
                    )}
                    {visibleSeries.wind && (
                        <YAxis
                            yAxisId="right_wind"
                            orientation="right"
                            hide
                        />
                    )}
                    {visibleSeries.uv && (
                        <YAxis
                            yAxisId="right_uv"
                            orientation="right"
                            domain={[0, 12]}
                            allowDecimals={false}
                            hide
                        />
                    )}
                    <Tooltip
                        contentStyle={{
                            backgroundColor: darkMode ? "rgba(33, 37, 41, 0.7)" : "rgba(255, 255, 255, 0.7)",
                            backdropFilter: "blur(10px)",
                            borderRadius: "15px",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                            color: tooltipText,
                        }}
                        itemStyle={{ color: tooltipText }}
                        labelStyle={{ color: tooltipText, fontWeight: "bold", marginBottom: "5px" }}
                        labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0) {
                                return payload[0].payload.fullTime;
                            }
                            return label;
                        }}
                        cursor={{ stroke: axisColor, strokeWidth: 1, strokeDasharray: "5 5" }}
                        formatter={(value, name) => {
                            if (name === "temp") return [`${value}${unitLabels.temperature}`, "Temperature"];
                            if (name === "uvIndex") return [value, "UV Index"];
                            if (name === "pop") return [`${value}%`, "Rain Probability"];
                            if (name === "windSpeed") return [`${value} ${unitLabels.speed}`, "Wind Speed"];
                            return [value, name];
                        }}
                    />
                    {visibleSeries.temp && (
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="temp"
                            stroke="url(#splitColor)"
                            strokeWidth={showAllDays ? 2 : 3} // Thinner line for more data
                            fillOpacity={1}
                            fill="url(#splitFill)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: "url(#splitColor)" }}
                            dot={false}
                        />
                    )}
                    {visibleSeries.pop && (
                        <Line
                            yAxisId="right_pop"
                            type="monotone"
                            dataKey="pop"
                            stroke="#2196F3"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: "#2196F3" }}
                        />
                    )}
                    {visibleSeries.wind && (
                        <Line
                            yAxisId="right_wind"
                            type="monotone"
                            dataKey="windSpeed"
                            stroke="#009688"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: "#009688" }}
                        />
                    )}
                    {visibleSeries.uv && (
                        <Line
                            yAxisId="right_uv"
                            type="monotone"
                            dataKey="uvIndex"
                            stroke="#9C27B0"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: "#9C27B0" }}
                        />
                    )}
                    {currentHour !== null && !showAllDays && (
                        <ReferenceLine
                            yAxisId="left"
                            x={currentHour}
                            stroke={referenceLineColor}
                            strokeDasharray="3 3"
                            label={{
                                value: "Now",
                                position: "top",
                                fill: referenceLineColor,
                                fontSize: 12,
                                fontWeight: "bold"
                            }}
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TemperatureChart;
