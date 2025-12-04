"use client";

import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer } from "lucide-react";
import { useEffect, useState } from "react";

interface WeatherData {
    temperature: number;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
}

const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="text-yellow-400" size={32} />;
    if (code >= 1 && code <= 3) return <Cloud className="text-gray-400" size={32} />;
    if (code >= 51 && code <= 67) return <CloudRain className="text-blue-400" size={32} />;
    if (code >= 71 && code <= 77) return <CloudSnow className="text-white" size={32} />;
    return <Cloud className="text-gray-400" size={32} />;
};

const getWeatherDescription = (code: number) => {
    if (code === 0) return "CLEAR";
    if (code >= 1 && code <= 3) return "CLOUDY";
    if (code >= 51 && code <= 55) return "DRIZZLE";
    if (code >= 61 && code <= 67) return "RAIN";
    if (code >= 71 && code <= 77) return "SNOW";
    if (code >= 80 && code <= 82) return "SHOWERS";
    return "UNKNOWN";
};

export default function WeatherCard() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Tokyo coordinates
                const response = await fetch(
                    "https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=Asia/Tokyo"
                );
                const data = await response.json();
                setWeather({
                    temperature: Math.round(data.current.temperature_2m),
                    weatherCode: data.current.weather_code,
                    windSpeed: Math.round(data.current.wind_speed_10m),
                    humidity: data.current.relative_humidity_2m,
                });
            } catch (err) {
                setError("FETCH_FAILED");
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="brutalist-card h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold tracking-wider text-[var(--accent)]">
                    WEATHER::TOKYO
                </h2>
                <span className="text-xs text-[var(--border-color)]">LIVE</span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-24">
                    <span className="text-[var(--border-color)] animate-pulse">LOADING...</span>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-24">
                    <span className="text-red-500">ERROR: {error}</span>
                </div>
            ) : weather ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        {getWeatherIcon(weather.weatherCode)}
                        <div>
                            <p className="text-3xl font-bold">{weather.temperature}°C</p>
                            <p className="text-xs text-[var(--border-color)]">
                                {getWeatherDescription(weather.weatherCode)}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                            <Wind size={14} className="text-[var(--accent)]" />
                            <span>{weather.windSpeed} km/h</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Thermometer size={14} className="text-[var(--accent)]" />
                            <span>{weather.humidity}%</span>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
