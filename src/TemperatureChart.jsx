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

const TemperatureChart = ({ data, darkMode, timezone }) => {
    const [visibleSeries, setVisibleSeries] = useState({ temp: true, uv: true });

    // Format data for Recharts
    const chartData = data.map((hour) => {
        // Parse hour directly from ISO string "YYYY-MM-DDTHH:MM"
        const hourStr = hour.time.split("T")[1].slice(0, 2);
        const hourInt = parseInt(hourStr, 10);
        return {
            time: hourInt, // Just the number
            fullTime: `${hourInt}:00`, // For tooltip
            temp: Math.round(hour.values.temperature),
            uvIndex: hour.values.uvIndex || 0,
        };
    });

    // Calculate current hour in the target timezone
    let currentHour = null;
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

    // Calculate min and max for gradient offset
    const temps = chartData.map(d => d.temp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);

    const gradientOffset = () => {
        if (max <= 0) return 0;
        if (min >= 0) return 1;
        return max / (max - min);
    };

    const off = gradientOffset();

    const axisColor = darkMode ? "#ccc" : "#888";
    const gridColor = darkMode ? "#555" : "#ccc";
    const tooltipText = darkMode ? "#fff" : "#000";
    const referenceLineColor = darkMode ? "#ff4d4d" : "#ff0000"; // Red for visibility

    return (
        <div style={{ width: "100%", height: 300, minWidth: 0 }}>
            <div className="d-flex justify-content-end gap-3 mb-2 px-2">
                <Form.Check
                    type="switch"
                    id="temp-switch"
                    label="Temperature"
                    checked={visibleSeries.temp}
                    onChange={(e) => setVisibleSeries(prev => ({ ...prev, temp: e.target.checked }))}
                    style={{ color: darkMode ? "#ccc" : "#333", fontSize: "0.9rem" }}
                />
                <Form.Check
                    type="switch"
                    id="uv-switch"
                    label="UV Index"
                    checked={visibleSeries.uv}
                    onChange={(e) => setVisibleSeries(prev => ({ ...prev, uv: e.target.checked }))}
                    style={{ color: darkMode ? "#ccc" : "#333", fontSize: "0.9rem" }}
                />
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
                    />
                    {visibleSeries.temp && (
                        <YAxis
                            yAxisId="left"
                            stroke={axisColor}
                            tick={{ fontSize: 12, fill: axisColor }}
                            tickLine={false}
                            axisLine={false}
                            label={{ value: '°C', angle: -90, position: 'insideLeft', fill: axisColor, fontSize: 10 }}
                        />
                    )}
                    {visibleSeries.uv && (
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#9C27B0" // Purple for UV
                            tick={{ fontSize: 12, fill: "#9C27B0" }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 12]} // UV Index typically 0-11+
                            allowDecimals={false}
                            label={{ value: 'UV', angle: 90, position: 'insideRight', fill: "#9C27B0", fontSize: 10 }}
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
                            if (name === "temp") return [`${value}°C`, "Temperature"];
                            if (name === "uvIndex") return [value, "UV Index"];
                            return [value, name];
                        }}
                    />
                    {visibleSeries.temp && (
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="temp"
                            stroke="url(#splitColor)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#splitFill)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: "url(#splitColor)" }}
                        />
                    )}
                    {visibleSeries.uv && (
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="uvIndex"
                            stroke="#9C27B0"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: "#9C27B0" }}
                        />
                    )}
                    {currentHour !== null && (
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
