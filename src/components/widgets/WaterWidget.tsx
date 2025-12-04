"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, X, Check } from "lucide-react";

interface DrinkType {
    id: string;
    name: string;
    maxMl: number;
    emoji: string;
    color: string;
    containerType: "tumbler" | "mug" | "glass" | "bottle";
}

interface DrinkHistory {
    drinkId: string;
    ml: number;
    color: string;
}

const DRINK_TYPES: DrinkType[] = [
    { id: "water", name: "水", maxMl: 350, emoji: "💧", color: "#29B6F6", containerType: "tumbler" },
    { id: "tea", name: "お茶", maxMl: 250, emoji: "🍵", color: "#66BB6A", containerType: "mug" },
    { id: "coffee", name: "コーヒー", maxMl: 240, emoji: "☕", color: "#8D6E63", containerType: "mug" },
    { id: "juice", name: "ジュース", maxMl: 200, emoji: "🧃", color: "#FFA726", containerType: "glass" },
    { id: "smoothie", name: "スムージー", maxMl: 300, emoji: "🥤", color: "#EC407A", containerType: "glass" },
    { id: "sports", name: "スポドリ", maxMl: 500, emoji: "💪", color: "#26C6DA", containerType: "bottle" },
];

const STORAGE_KEY = "dashboard-water-tracker-v2";
const DEFAULT_GOAL = 2000;

interface WaterData {
    date: string;
    amount: number;
    goal: number;
    history: DrinkHistory[];
}

// Cuter, fluffy llama path
const LLAMA_PATH = `
        M 50 140
        // Left body (fluffy)
        Q 40 140 35 130
        Q 30 125 32 115
        Q 28 105 35 95
        Q 32 85 40 75
        // Neck left
        Q 42 65 45 55
        Q 42 45 45 35
        // Head left
        Q 45 25 50 15
        Q 52 5 60 5
        // Head top
        Q 70 2 80 5
        // Head right
        Q 88 5 90 15
        Q 95 25 95 35
        // Neck right
        Q 98 45 95 55
        Q 98 65 100 75
        // Right body (fluffy)
        Q 108 85 105 95
        Q 112 105 108 115
        Q 110 125 105 130
        Q 100 140 90 140
        Z
    `;

export default function WaterWidget() {
    const [data, setData] = useState<WaterData>({
        date: new Date().toDateString(),
        amount: 0,
        goal: DEFAULT_GOAL,
        history: [],
    });
    const [selectedDrink, setSelectedDrink] = useState<DrinkType | null>(null);
    const [fillLevel, setFillLevel] = useState(50);
    const [mounted, setMounted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.date !== new Date().toDateString()) {
                setData({ date: new Date().toDateString(), amount: 0, goal: parsed.goal || DEFAULT_GOAL, history: [] });
            } else {
                setData(parsed);
            }
        }
    }, []);

    const saveData = (newData: WaterData) => {
        setData(newData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    };

    // Calculate fill level from mouse position
    const calculateFillFromEvent = (clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const relativeY = clientY - rect.top;
        // Add padding at top and bottom for easier max/min selection
        const paddedHeight = rect.height * 0.9;
        const paddedTop = rect.height * 0.05;
        const adjustedY = relativeY - paddedTop;
        const percentage = Math.max(0, Math.min(100, ((paddedHeight - adjustedY) / paddedHeight) * 100));
        setFillLevel(percentage);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectedDrink) return;
        setIsDragging(true);
        calculateFillFromEvent(e.clientY);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !selectedDrink) return;
        calculateFillFromEvent(e.clientY);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        // Don't stop dragging on leave - let them continue if they come back
    };

    // Touch events for mobile
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!selectedDrink) return;
        setIsDragging(true);
        calculateFillFromEvent(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging || !selectedDrink) return;
        e.preventDefault();
        calculateFillFromEvent(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const confirmDrink = () => {
        if (!selectedDrink) return;
        const ml = Math.round((fillLevel / 100) * selectedDrink.maxMl);
        const newHistory: DrinkHistory = { drinkId: selectedDrink.id, ml, color: selectedDrink.color };
        const newData = {
            ...data,
            amount: data.amount + ml,
            history: [...data.history, newHistory],
        };
        saveData(newData);
        setIsAnimating(true);
        setTimeout(() => {
            setSelectedDrink(null);
            setFillLevel(50);
            setIsAnimating(false);
        }, 400);
    };

    const cancelDrink = () => {
        setSelectedDrink(null);
        setFillLevel(50);
    };

    const resetDay = () => {
        saveData({ ...data, amount: 0, history: [] });
    };

    const percentage = Math.min((data.amount / data.goal) * 100, 100);
    const currentMl = Math.round((fillLevel / 100) * (selectedDrink?.maxMl || 0));

    // Calculate color layers
    const calculateLayers = () => {
        if (data.history.length === 0) return [];
        let currentHeight = 0;
        return data.history.map(h => {
            const heightPercent = (h.ml / data.goal) * 100;
            const layer = { color: h.color, startY: currentHeight, height: Math.min(heightPercent, 100 - currentHeight) };
            currentHeight += heightPercent;
            return layer;
        });
    };

    const layers = calculateLayers();

    if (!mounted) return null;

    return (
        <div className="h-full flex flex-col bg-[#1a1a1a]">
            {/* Header */}
            <div className="widget-title flex-shrink-0">
                <span className="flex items-center gap-1.5">
                    <span className="text-cyan-400">💧</span>
                    WATER
                </span>
            </div>

            {selectedDrink ? (
                <div
                    className="flex-1 flex flex-col items-center justify-between p-3 min-h-0"
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <p className="text-[10px] text-gray-500">ドラッグまたはタップで量を調整</p>

                    <div
                        ref={containerRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="relative cursor-ns-resize select-none"
                        style={{ width: 80, height: 120 }}
                    >
                        {selectedDrink.containerType === "tumbler" && (
                            <svg viewBox="0 0 70 100" className="w-full h-full">
                                <defs>
                                    <clipPath id="tClip"><path d="M 12 10 L 14 88 Q 14 92 18 92 L 52 92 Q 56 92 56 88 L 58 10 Z" /></clipPath>
                                </defs>
                                <path d="M 10 8 L 13 90 Q 13 95 18 95 L 52 95 Q 57 95 57 90 L 60 8 Q 60 4 55 4 L 15 4 Q 10 4 10 8 Z"
                                    fill="#404040" stroke="#555" strokeWidth="2" />
                                <rect x="10" y={95 - (fillLevel * 0.85)} width="50" height={fillLevel * 0.85}
                                    fill={selectedDrink.color} opacity="0.8" clipPath="url(#tClip)" className="transition-all duration-100" />
                            </svg>
                        )}
                        {selectedDrink.containerType === "mug" && (
                            <svg viewBox="0 0 70 100" className="w-full h-full">
                                <defs>
                                    <clipPath id="mClip"><path d="M 8 18 L 8 82 Q 8 88 14 88 L 42 88 Q 48 88 48 82 L 48 18 Z" /></clipPath>
                                </defs>
                                <path d="M 6 16 L 6 84 Q 6 92 14 92 L 42 92 Q 50 92 50 84 L 50 16 Q 50 12 46 12 L 10 12 Q 6 12 6 16 Z"
                                    fill="#505050" stroke="#666" strokeWidth="2" />
                                <path d="M 50 30 Q 62 30 62 50 Q 62 70 50 70" fill="none" stroke="#666" strokeWidth="5" />
                                <rect x="6" y={92 - (fillLevel * 0.74)} width="44" height={fillLevel * 0.74}
                                    fill={selectedDrink.color} opacity="0.8" clipPath="url(#mClip)" className="transition-all duration-100" />
                            </svg>
                        )}
                        {selectedDrink.containerType === "glass" && (
                            <svg viewBox="0 0 70 100" className="w-full h-full">
                                <defs>
                                    <clipPath id="gClip"><path d="M 16 10 L 12 88 Q 12 92 20 92 L 50 92 Q 58 92 58 88 L 54 10 Z" /></clipPath>
                                </defs>
                                <path d="M 15 8 L 11 90 Q 11 95 20 95 L 50 95 Q 59 95 59 90 L 55 8 Q 54 4 48 4 L 22 4 Q 16 4 15 8 Z"
                                    fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                <rect x="11" y={95 - (fillLevel * 0.85)} width="48" height={fillLevel * 0.85}
                                    fill={selectedDrink.color} opacity="0.7" clipPath="url(#gClip)" className="transition-all duration-100" />
                            </svg>
                        )}
                        {selectedDrink.containerType === "bottle" && (
                            <svg viewBox="0 0 70 100" className="w-full h-full">
                                <defs>
                                    <clipPath id="bClip"><path d="M 22 32 L 22 88 Q 22 92 28 92 L 42 92 Q 48 92 48 88 L 48 32 Q 48 25 42 20 L 28 20 Q 22 25 22 32 Z" /></clipPath>
                                </defs>
                                <rect x="28" y="4" width="14" height="14" rx="2" fill="#444" stroke="#555" />
                                <path d="M 28 18 Q 20 24 20 34 L 20 90 Q 20 96 28 96 L 42 96 Q 50 96 50 90 L 50 34 Q 50 24 42 18 Z"
                                    fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                                <rect x="20" y={96 - (fillLevel * 0.62)} width="30" height={fillLevel * 0.62}
                                    fill={selectedDrink.color} opacity="0.7" clipPath="url(#bClip)" className="transition-all duration-100" />
                            </svg>
                        )}
                    </div>

                    <div className="text-center">
                        <span className="text-2xl font-bold" style={{ color: selectedDrink.color }}>{currentMl}ml</span>
                        <p className="text-[9px] text-gray-500">{selectedDrink.emoji} {selectedDrink.name}</p>
                    </div>

                    <div className="flex gap-2 w-full">
                        <button onClick={cancelDrink} className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] text-gray-400 bg-[#252525] border border-[#3a3a3a] rounded">
                            <X size={12} />キャンセル
                        </button>
                        <button onClick={confirmDrink} className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] text-white bg-cyan-600 hover:bg-cyan-700 rounded">
                            <Check size={12} />追加
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-0 relative">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(41,182,246,0.1),transparent_70%)]" />

                    {/* Stats */}
                    <div className="px-3 pt-2 flex-shrink-0 z-10">
                        <div className="text-center">
                            <div className={`text-2xl font-bold text-cyan-400 transition-transform ${isAnimating ? "scale-110" : ""}`}>
                                {data.amount}ml
                            </div>
                            <div className="text-[9px] text-gray-500">目標 {data.goal}ml • {Math.round(percentage)}%</div>
                        </div>
                        <div className="w-full h-1.5 bg-[#252525] rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                        </div>
                    </div>

                    {/* Cute Llama Design */}
                    <div className="flex-1 flex items-center justify-center overflow-visible z-10">
                        <svg viewBox="0 0 140 150" className="w-36 h-36" style={{ overflow: "visible" }}>
                            <style>{`
                                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
                                .animate-float { animation: float 3s ease-in-out infinite; }
                            `}</style>

                            <g className="animate-float">
                                {/* Surfboard / Base */}
                                <ellipse cx="70" cy="142" rx="45" ry="8" fill="#4CAF50" />
                                <ellipse cx="70" cy="145" rx="35" ry="5" fill="#2E7D32" opacity="0.5" />

                                {/* Llama Body Clip */}
                                <defs>
                                    <clipPath id="cuteLlamaClip">
                                        <path d={LLAMA_PATH} />
                                    </clipPath>
                                </defs>

                                {/* Base Body Color (White) */}
                                <path d={LLAMA_PATH} fill="#F5F5F5" />

                                {/* Liquid Fill */}
                                <g clipPath="url(#cuteLlamaClip)">
                                    {/* Background liquid */}
                                    <rect x="0" y="0" width="140" height="150" fill="#F5F5F5" />

                                    {/* Fill layers */}
                                    {layers.map((layer, i) => (
                                        <rect
                                            key={i}
                                            x="0"
                                            y={140 - (layer.startY + layer.height) * 1.3}
                                            width="140"
                                            height={layer.height * 1.3 + 2}
                                            fill={layer.color}
                                        />
                                    ))}

                                    {/* Wave effect */}
                                    {layers.length > 0 && (
                                        <path
                                            d={`M 0 ${140 - percentage * 1.3} 
                                                Q 35 ${140 - percentage * 1.3 - 5} 70 ${140 - percentage * 1.3}
                                                Q 105 ${140 - percentage * 1.3 + 5} 140 ${140 - percentage * 1.3}
                                                V 150 H 0 Z`}
                                            fill={layers[layers.length - 1]?.color || "#29B6F6"}
                                            opacity="0.4"
                                        >
                                            <animate
                                                attributeName="d"
                                                dur="2s"
                                                repeatCount="indefinite"
                                                values={`
                                                    M 0 ${140 - percentage * 1.3} Q 35 ${140 - percentage * 1.3 - 4} 70 ${140 - percentage * 1.3} Q 105 ${140 - percentage * 1.3 + 4} 140 ${140 - percentage * 1.3} V 150 H 0 Z;
                                                    M 0 ${140 - percentage * 1.3} Q 35 ${140 - percentage * 1.3 + 4} 70 ${140 - percentage * 1.3} Q 105 ${140 - percentage * 1.3 - 4} 140 ${140 - percentage * 1.3} V 150 H 0 Z;
                                                    M 0 ${140 - percentage * 1.3} Q 35 ${140 - percentage * 1.3 - 4} 70 ${140 - percentage * 1.3} Q 105 ${140 - percentage * 1.3 + 4} 140 ${140 - percentage * 1.3} V 150 H 0 Z
                                                `}
                                            />
                                        </path>
                                    )}
                                </g>

                                {/* Face Details (Always visible on top) */}
                                <g transform="translate(0, 0)">
                                    {/* Ears */}
                                    <ellipse cx="55" cy="15" rx="4" ry="8" fill="#F5F5F5" transform="rotate(-10 55 15)" />
                                    <ellipse cx="85" cy="15" rx="4" ry="8" fill="#F5F5F5" transform="rotate(10 85 15)" />

                                    {/* Eyes */}
                                    <circle cx="60" cy="25" r="2" fill="#333" />
                                    <circle cx="80" cy="25" r="2" fill="#333" />

                                    {/* Muzzle */}
                                    <ellipse cx="70" cy="32" rx="6" ry="4" fill="#E0E0E0" opacity="0.5" />
                                    <path d="M 68 32 Q 70 34 72 32" fill="none" stroke="#333" strokeWidth="1" strokeLinecap="round" />
                                </g>

                                {/* Feet */}
                                <path d="M 50 138 L 50 145" stroke="#8D6E63" strokeWidth="4" strokeLinecap="round" />
                                <path d="M 90 138 L 90 145" stroke="#8D6E63" strokeWidth="4" strokeLinecap="round" />
                            </g>

                            {/* Sparkles */}
                            {percentage >= 100 && (
                                <g>
                                    <text x="20" y="40" fontSize="12" className="animate-pulse">✨</text>
                                    <text x="110" y="30" fontSize="12" className="animate-pulse" style={{ animationDelay: "0.5s" }}>⭐</text>
                                </g>
                            )}
                        </svg>
                    </div>

                    {/* Drink buttons */}
                    <div className="px-2 pb-2 flex-shrink-0 z-10">
                        <div className="grid grid-cols-7 gap-1">
                            {DRINK_TYPES.map((drink) => (
                                <button
                                    key={drink.id}
                                    onClick={() => { setSelectedDrink(drink); setFillLevel(50); }}
                                    className="flex flex-col items-center p-1.5 bg-[#151515] border border-[#252525] hover:border-cyan-500/50 rounded transition-all hover:scale-105 group"
                                    title={`${drink.name} (${drink.maxMl}ml)`}
                                >
                                    <span className="text-base group-hover:scale-110 transition-transform">{drink.emoji}</span>
                                </button>
                            ))}
                            <button
                                onClick={resetDay}
                                className="flex flex-col items-center p-1.5 bg-[#151515] border border-[#252525] hover:border-red-500/50 rounded transition-all group"
                                title="リセット"
                            >
                                <RotateCcw size={16} className="text-gray-500 group-hover:text-red-400 transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
