"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";

type ClockDesign = "minimal" | "digital" | "neon" | "retro" | "matrix" | "analog" | "analog-modern" | "analog-roman" | "analog-minimal";

const STORAGE_KEY = "dashboard-clock-design";

const DESIGN_CATEGORIES = [
    {
        name: "デジタル",
        designs: [
            { id: "minimal" as ClockDesign, name: "ミニマル" },
            { id: "digital" as ClockDesign, name: "LED" },
            { id: "neon" as ClockDesign, name: "ネオン" },
            { id: "retro" as ClockDesign, name: "レトロ" },
            { id: "matrix" as ClockDesign, name: "マトリックス" },
        ],
    },
    {
        name: "アナログ",
        designs: [
            { id: "analog" as ClockDesign, name: "クラシック" },
            { id: "analog-modern" as ClockDesign, name: "モダン" },
            { id: "analog-roman" as ClockDesign, name: "ローマ数字" },
            { id: "analog-minimal" as ClockDesign, name: "ミニマル" },
        ],
    },
];

export default function ClockWidget() {
    const [time, setTime] = useState(new Date());
    const [design, setDesign] = useState<ClockDesign>("minimal");
    const [showSettings, setShowSettings] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setDesign(saved as ClockDesign);
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const saveDesign = (d: ClockDesign) => {
        setDesign(d);
        localStorage.setItem(STORAGE_KEY, d);
        setShowSettings(false);
    };

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const timeStr = time.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
    const timeWithSec = time.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateStr = time.toLocaleDateString("ja-JP", { month: "short", day: "numeric", weekday: "short" });

    if (!mounted) return null;

    // Analog clock calculations
    const hourDeg = (hours % 12) * 30 + minutes * 0.5;
    const minDeg = minutes * 6;
    const secDeg = seconds * 6;

    const renderAnalogClock = (style: "classic" | "modern" | "roman" | "minimal") => {
        const romanNumerals = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-1">
                <div className={`relative rounded-full ${style === "classic" ? "w-24 h-24 border-2 border-gray-600 bg-[#1a1a1a]" :
                        style === "modern" ? "w-24 h-24 border border-cyan-500/30 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" :
                            style === "roman" ? "w-24 h-24 border-2 border-amber-700/50 bg-[#1a1810]" :
                                "w-20 h-20 bg-transparent"
                    }`}>
                    {/* Hour markers or numbers */}
                    {style === "roman" ? (
                        romanNumerals.map((num, i) => {
                            const angle = (i * 30 - 90) * (Math.PI / 180);
                            const x = 50 + 38 * Math.cos(angle);
                            const y = 50 + 38 * Math.sin(angle);
                            return (
                                <span key={i} className="absolute text-[6px] text-amber-200/80 font-serif"
                                    style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
                                    {num}
                                </span>
                            );
                        })
                    ) : style !== "minimal" ? (
                        [...Array(12)].map((_, i) => (
                            <div key={i} className={`absolute ${style === "modern" ? "w-0.5 h-1.5 bg-cyan-500/50" : "w-0.5 h-2 bg-gray-500"
                                }`} style={{
                                    top: style === "modern" ? "6px" : "4px",
                                    left: "50%",
                                    transformOrigin: `50% ${style === "modern" ? "42px" : "44px"}`,
                                    transform: `translateX(-50%) rotate(${i * 30}deg)`,
                                }} />
                        ))
                    ) : (
                        [0, 3, 6, 9].map((i) => (
                            <div key={i} className="absolute w-1 h-1 bg-gray-500 rounded-full" style={{
                                top: i === 0 ? "8%" : i === 6 ? "88%" : "47%",
                                left: i === 3 ? "88%" : i === 9 ? "8%" : "47%",
                            }} />
                        ))
                    )}

                    {/* Hour hand */}
                    <div className={`absolute rounded-full ${style === "modern" ? "w-1 h-5 bg-white" :
                            style === "roman" ? "w-1.5 h-5 bg-amber-300" :
                                style === "minimal" ? "w-0.5 h-5 bg-gray-300" :
                                    "w-1 h-6 bg-gray-300"
                        }`} style={{
                            bottom: "50%", left: "50%", transformOrigin: "50% 100%",
                            transform: `translateX(-50%) rotate(${hourDeg}deg)`,
                        }} />

                    {/* Minute hand */}
                    <div className={`absolute rounded-full ${style === "modern" ? "w-0.5 h-8 bg-white/80" :
                            style === "roman" ? "w-1 h-7 bg-amber-200" :
                                style === "minimal" ? "w-px h-7 bg-gray-400" :
                                    "w-0.5 h-8 bg-gray-400"
                        }`} style={{
                            bottom: "50%", left: "50%", transformOrigin: "50% 100%",
                            transform: `translateX(-50%) rotate(${minDeg}deg)`,
                        }} />

                    {/* Second hand */}
                    <div className={`absolute rounded-full ${style === "modern" ? "w-px h-9 bg-cyan-400" :
                            style === "roman" ? "w-px h-8 bg-amber-500" :
                                style === "minimal" ? "w-px h-8 bg-cyan-500/50" :
                                    "w-px h-9 bg-cyan-500"
                        }`} style={{
                            bottom: "50%", left: "50%", transformOrigin: "50% 100%",
                            transform: `translateX(-50%) rotate(${secDeg}deg)`,
                        }} />

                    {/* Center dot */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${style === "modern" ? "w-2 h-2 bg-cyan-400" :
                            style === "roman" ? "w-2 h-2 bg-amber-400" :
                                style === "minimal" ? "w-1.5 h-1.5 bg-gray-500" :
                                    "w-2 h-2 bg-cyan-500"
                        }`} />
                </div>
                <p className={`text-[9px] ${style === "roman" ? "text-amber-600" : "text-gray-600"
                    }`}>{dateStr}</p>
            </div>
        );
    };

    const renderClock = () => {
        switch (design) {
            case "minimal":
                return (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <p className="text-3xl font-light text-gray-300 tracking-wider">{timeStr}</p>
                        <p className="text-[10px] text-gray-600 mt-2">{dateStr}</p>
                    </div>
                );

            case "digital":
                return (
                    <div className="flex-1 flex flex-col items-center justify-center bg-black/50 mx-2 my-2 rounded border border-[#333]">
                        <p className="text-3xl font-mono text-green-400 tracking-widest" style={{ textShadow: "0 0 10px #22c55e" }}>
                            {timeWithSec}
                        </p>
                        <p className="text-[10px] text-green-600 mt-1 font-mono">{dateStr}</p>
                    </div>
                );

            case "neon":
                return (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"
                            style={{ textShadow: "0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)" }}>
                            {timeStr}
                        </p>
                        <p className="text-[10px] text-purple-400 mt-2">{dateStr}</p>
                    </div>
                );

            case "retro":
                return (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="bg-[#2a1810] border-4 border-[#8b4513] rounded-lg px-4 py-2 shadow-inner">
                            <p className="text-3xl font-serif text-amber-200">{timeStr}</p>
                        </div>
                        <p className="text-[10px] text-amber-600 mt-2 font-serif">{dateStr}</p>
                    </div>
                );

            case "matrix":
                return (
                    <div className="flex-1 flex flex-col items-center justify-center bg-black mx-2 my-2 rounded overflow-hidden relative">
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)`,
                        }} />
                        <p className="text-3xl font-mono text-green-500 tracking-widest z-10" style={{
                            textShadow: "0 0 5px #00ff00, 0 0 10px #00ff00",
                            fontFamily: "monospace",
                        }}>
                            {timeWithSec}
                        </p>
                        <p className="text-[10px] text-green-700 mt-1 font-mono z-10">{dateStr}</p>
                    </div>
                );

            case "analog":
                return renderAnalogClock("classic");
            case "analog-modern":
                return renderAnalogClock("modern");
            case "analog-roman":
                return renderAnalogClock("roman");
            case "analog-minimal":
                return renderAnalogClock("minimal");
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0 flex items-center justify-between">
                <span>CLOCK</span>
                <button onClick={() => setShowSettings(!showSettings)} className="p-0.5 text-gray-600 hover:text-gray-400">
                    <Settings size={12} />
                </button>
            </div>

            {showSettings ? (
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    {DESIGN_CATEGORIES.map((cat) => (
                        <div key={cat.name} className="mb-3">
                            <p className="text-[9px] text-gray-500 mb-1.5">{cat.name}</p>
                            <div className="grid grid-cols-2 gap-1">
                                {cat.designs.map((d) => (
                                    <button
                                        key={d.id}
                                        onClick={() => saveDesign(d.id)}
                                        className={`p-1.5 text-center text-[9px] border transition-colors ${design === d.id
                                            ? "bg-[#252525] border-cyan-600/50 text-cyan-400"
                                            : "bg-[#151515] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]"
                                            }`}
                                    >
                                        {d.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                renderClock()
            )}
        </div>
    );
}
