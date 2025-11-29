import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const TemperatureChart = ({ data, darkMode }) => {
    // Format data for Recharts
    const chartData = data.map((hour) => ({
        time: new Date(hour.time).getHours() + ":00",
        temp: Math.round(hour.values.temperature),
    }));

    const axisColor = darkMode ? "#ccc" : "#888";
    const gridColor = darkMode ? "#555" : "#ccc";
    const tooltipBg = darkMode ? "rgba(33, 37, 41, 0.9)" : "rgba(255, 255, 255, 0.8)";
    const tooltipText = darkMode ? "#fff" : "#000";

    return (
        <div style={{ width: "100%", height: 300, minWidth: 0 }}>
            <ResponsiveContainer>
                <LineChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="time" stroke={axisColor} tick={{ fontSize: 12, fill: axisColor }} />
                    <YAxis stroke={axisColor} tick={{ fontSize: 12, fill: axisColor }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: tooltipBg,
                            borderRadius: "10px",
                            border: "none",
                            color: tooltipText,
                        }}
                        itemStyle={{ color: tooltipText }}
                        labelStyle={{ color: tooltipText }}
                    />
                    <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#ff7300"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#ff7300" }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TemperatureChart;
