import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const TemperatureChart = ({ data, darkMode }) => {
    // Format data for Recharts
    const chartData = data.map((hour) => {
        // Parse hour directly from ISO string "YYYY-MM-DDTHH:MM"
        const hourStr = hour.time.split("T")[1].slice(0, 2);
        const hourInt = parseInt(hourStr, 10);
        return {
            time: hourInt, // Just the number
            fullTime: `${hourInt}:00`, // For tooltip
            temp: Math.round(hour.values.temperature),
        };
    });

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

    return (
        <div style={{ width: "100%", height: 300, minWidth: 0 }}>
            <ResponsiveContainer debounce={50} minWidth={0}>
                <AreaChart
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
                    <YAxis
                        stroke={axisColor}
                        tick={{ fontSize: 12, fill: axisColor }}
                        tickLine={false}
                        axisLine={false}
                    />
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
                    />
                    <Area
                        type="monotone"
                        dataKey="temp"
                        stroke="url(#splitColor)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#splitFill)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: "url(#splitColor)" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TemperatureChart;
