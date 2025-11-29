import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const TemperatureChart = ({ data }) => {
    // Format data for Recharts
    const chartData = data.map((hour) => ({
        time: new Date(hour.time).getHours() + ":00",
        temp: Math.round(hour.values.temperature),
    }));

    return (
        <div style={{ width: "100%", height: 300 }}>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" vertical={false} />
                    <XAxis dataKey="time" stroke="#888" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#888" tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            borderRadius: "10px",
                            border: "none",
                        }}
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
