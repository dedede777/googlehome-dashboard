"use client";

import { Cloud, CloudRain, Sun, CloudSnow, Settings, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface City {
    id: string;
    name: string;
    nameEn: string;
    lat: number;
    lon: number;
}

interface DailyForecast {
    date: string;
    tempMax: number;
    tempMin: number;
    code: number;
}

interface WeatherData {
    current: { temp: number; code: number };
    daily: DailyForecast[];
}

const CITIES: City[] = [
    { id: "tokyo", name: "東京", nameEn: "TOKYO", lat: 35.6762, lon: 139.6503 },
    { id: "osaka", name: "大阪", nameEn: "OSAKA", lat: 34.6937, lon: 135.5023 },
    { id: "nagoya", name: "名古屋", nameEn: "NAGOYA", lat: 35.1815, lon: 136.9066 },
    { id: "sapporo", name: "札幌", nameEn: "SAPPORO", lat: 43.0618, lon: 141.3545 },
    { id: "fukuoka", name: "福岡", nameEn: "FUKUOKA", lat: 33.5904, lon: 130.4017 },
    { id: "sendai", name: "仙台", nameEn: "SENDAI", lat: 38.2682, lon: 140.8694 },
    { id: "hiroshima", name: "広島", nameEn: "HIROSHIMA", lat: 34.3853, lon: 132.4553 },
    { id: "kyoto", name: "京都", nameEn: "KYOTO", lat: 35.0116, lon: 135.7681 },
    { id: "yokohama", name: "横浜", nameEn: "YOKOHAMA", lat: 35.4437, lon: 139.6380 },
    { id: "kobe", name: "神戸", nameEn: "KOBE", lat: 34.6901, lon: 135.1956 },
];

const STORAGE_KEY = "dashboard-weather-settings";

type ViewMode = "today" | "week";

export default function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]);
    const [viewMode, setViewMode] = useState<ViewMode>("today");
    const [showSettings, setShowSettings] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load settings
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const settings = JSON.parse(saved);
            const city = CITIES.find(c => c.id === settings.cityId) || CITIES[0];
            setSelectedCity(city);
            setViewMode(settings.viewMode || "today");
        }
    }, []);

    // Fetch weather data
    useEffect(() => {
        if (!mounted) return;

        setLoading(true);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia/Tokyo&forecast_days=7`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const daily: DailyForecast[] = data.daily.time.map((date: string, i: number) => ({
                    date,
                    tempMax: Math.round(data.daily.temperature_2m_max[i]),
                    tempMin: Math.round(data.daily.temperature_2m_min[i]),
                    code: data.daily.weather_code[i],
                }));

                setWeather({
                    current: {
                        temp: Math.round(data.current.temperature_2m),
                        code: data.current.weather_code,
                    },
                    daily,
                });
                setLoading(false);
            })
            .catch(() => {
                setWeather(null);
                setLoading(false);
            });
    }, [selectedCity, mounted]);

    const saveSettings = (city: City, mode: ViewMode) => {
        setSelectedCity(city);
        setViewMode(mode);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ cityId: city.id, viewMode: mode }));
    };

    const getIcon = (code: number, size: number = 32) => {
        const className = size <= 16 ? "text-[#888]" : "text-[#666]";
        if (code === 0) return <Sun size={size} className={`${className} text-yellow-500`} />;
        if (code >= 51 && code <= 67) return <CloudRain size={size} className={`${className} text-blue-400`} />;
        if (code >= 71 && code <= 77) return <CloudSnow size={size} className={`${className} text-cyan-300`} />;
        return <Cloud size={size} className={className} />;
    };

    const getCondition = (code: number) => {
        if (code === 0) return "晴れ";
        if (code >= 1 && code <= 3) return "曇り";
        if (code >= 51 && code <= 67) return "雨";
        if (code >= 71 && code <= 77) return "雪";
        return "曇り";
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const days = ["日", "月", "火", "水", "木", "金", "土"];
        return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`;
    };

    const isToday = (dateStr: string) => {
        const today = new Date().toDateString();
        return new Date(dateStr).toDateString() === today;
    };

    if (!mounted) return null;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0">WEATHER</div>

            {showSettings ? (
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    {/* City selection */}
                    <p className="text-[9px] text-gray-500 mb-1">都市を選択</p>
                    <div className="grid grid-cols-2 gap-1 mb-3">
                        {CITIES.map(city => (
                            <button
                                key={city.id}
                                onClick={() => saveSettings(city, viewMode)}
                                className={`px-2 py-1 text-[9px] border transition-colors ${selectedCity.id === city.id
                                    ? "bg-[#252525] border-[#555] text-gray-200"
                                    : "bg-transparent border-[#2a2a2a] text-gray-500 hover:border-[#3a3a3a]"
                                    }`}
                            >
                                {city.name}
                            </button>
                        ))}
                    </div>

                    {/* View mode */}
                    <p className="text-[9px] text-gray-500 mb-1">表示モード</p>
                    <div className="flex gap-1">
                        <button
                            onClick={() => saveSettings(selectedCity, "today")}
                            className={`flex-1 px-2 py-1.5 text-[9px] border transition-colors ${viewMode === "today"
                                ? "bg-[#252525] border-[#555] text-gray-200"
                                : "bg-transparent border-[#2a2a2a] text-gray-500 hover:border-[#3a3a3a]"
                                }`}
                        >
                            今日の天気
                        </button>
                        <button
                            onClick={() => saveSettings(selectedCity, "week")}
                            className={`flex-1 px-2 py-1.5 text-[9px] border transition-colors ${viewMode === "week"
                                ? "bg-[#252525] border-[#555] text-gray-200"
                                : "bg-transparent border-[#2a2a2a] text-gray-500 hover:border-[#3a3a3a]"
                                }`}
                        >
                            週間予報
                        </button>
                    </div>
                </div>
            ) : viewMode === "today" ? (
                /* Today's weather */
                <div className="flex-1 flex flex-col items-center justify-center gap-2 p-2 min-h-0">
                    {loading ? (
                        <p className="text-[10px] text-gray-600">読み込み中...</p>
                    ) : weather ? (
                        <>
                            {getIcon(weather.current.code)}
                            <div className="text-center">
                                <p className="text-sm font-semibold text-[#888]">
                                    {selectedCity.nameEn}: {weather.current.temp}°C
                                </p>
                                <p className="text-[10px] text-[#666]">
                                    {getCondition(weather.current.code)}
                                </p>
                                {weather.daily[0] && (
                                    <p className="text-[9px] text-gray-600 mt-1">
                                        最高 {weather.daily[0].tempMax}° / 最低 {weather.daily[0].tempMin}°
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="text-[10px] text-red-400">取得失敗</p>
                    )}
                </div>
            ) : (
                /* Weekly forecast */
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    {loading ? (
                        <p className="text-[10px] text-gray-600">読み込み中...</p>
                    ) : weather ? (
                        <div className="space-y-1">
                            <p className="text-[9px] text-gray-500 mb-1">{selectedCity.name} 週間予報</p>
                            {weather.daily.map((day, i) => (
                                <div
                                    key={day.date}
                                    className={`flex items-center justify-between p-1 rounded ${isToday(day.date) ? "bg-[#252525]" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {getIcon(day.code, 14)}
                                        <span className={`text-[9px] ${isToday(day.date) ? "text-gray-200" : "text-gray-500"}`}>
                                            {isToday(day.date) ? "今日" : formatDate(day.date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px]">
                                        <span className="text-red-400">{day.tempMax}°</span>
                                        <span className="text-blue-400">{day.tempMin}°</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[10px] text-red-400">取得失敗</p>
                    )}
                </div>
            )}

            {/* Footer with settings button */}
            <div className="p-1.5 border-t border-[#2a2a2a] flex-shrink-0">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full flex items-center justify-center gap-1 py-1 text-[9px] text-gray-500 hover:text-gray-300 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
                >
                    {showSettings ? <X size={10} /> : <Settings size={10} />}
                    <span>{showSettings ? "完了" : "設定"}</span>
                </button>
            </div>
        </div>
    );
}
