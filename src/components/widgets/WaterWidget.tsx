"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, X, Check, Undo2 } from "lucide-react";

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

    const calculateFillFromEvent = (clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const relativeY = clientY - rect.top;
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

    const handleMouseUp = () => setIsDragging(false);

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

    const handleTouchEnd = () => setIsDragging(false);

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

    const undoLast = () => {
        if (data.history.length === 0) return;
        const lastEntry = data.history[data.history.length - 1];
        const newHistory = data.history.slice(0, -1);
        const newData = {
            ...data,
            amount: Math.max(0, data.amount - lastEntry.ml),
            history: newHistory,
        };
        saveData(newData);
    };

    const percentage = Math.min((data.amount / data.goal) * 100, 100);
    const currentMl = Math.round((fillLevel / 100) * (selectedDrink?.maxMl || 0));

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
                                <defs><clipPath id="tClip"><path d="M 12 10 L 14 88 Q 14 92 18 92 L 52 92 Q 56 92 56 88 L 58 10 Z" /></clipPath></defs>
                                <path d="M 10 8 L 13 90 Q 13 95 18 95 L 52 95 Q 57 95 57 90 L 60 8 Q 60 4 55 4 L 15 4 Q 10 4 10 8 Z"
                                    fill="#404040" stroke="#555" strokeWidth="2" />
                                <rect x="10" y={95 - (fillLevel * 0.85)} width="50" height={fillLevel * 0.85}
                                    fill={selectedDrink.color} opacity="0.8" clipPath="url(#tClip)" className="transition-all duration-100" />
                            </svg>
                        )}
                        {selectedDrink.containerType === "mug" && (
                            <svg viewBox="0 0 70 100" className="w-full h-full">
                                <defs><clipPath id="mClip"><path d="M 8 18 L 8 82 Q 8 88 14 88 L 42 88 Q 48 88 48 82 L 48 18 Z" /></clipPath></defs>
                                <path d="M 6 16 L 6 84 Q 6 92 14 92 L 42 92 Q 50 92 50 84 L 50 16 Q 50 12 46 12 L 10 12 Q 6 12 6 16 Z"
                                    fill="#505050" stroke="#666" strokeWidth="2" />
                                <path d="M 50 30 Q 62 30 62 50 Q 62 70 50 70" fill="none" stroke="#666" strokeWidth="5" />
                                <rect x="6" y={92 - (fillLevel * 0.74)} width="44" height={fillLevel * 0.74}
                                    fill={selectedDrink.color} opacity="0.8" clipPath="url(#mClip)" className="transition-all duration-100" />
                            </svg>
                        )}
                        {selectedDrink.containerType === "glass" && (
                            <svg viewBox="0 0 70 100" className="w-full h-full">
                                <defs><clipPath id="gClip"><path d="M 16 10 L 12 88 Q 12 92 20 92 L 50 92 Q 58 92 58 88 L 54 10 Z" /></clipPath></defs>
                                <path d="M 15 8 L 11 90 Q 11 95 20 95 L 50 95 Q 59 95 59 90 L 55 8 Q 54 4 48 4 L 22 4 Q 16 4 15 8 Z"
                                    fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                <rect x="11" y={95 - (fillLevel * 0.85)} width="48" height={fillLevel * 0.85}
                                    fill={selectedDrink.color} opacity="0.7" clipPath="url(#gClip)" className="transition-all duration-100" />
                            </svg>
                        )}
                        {selectedDrink.containerType === "bottle" && (
                            <svg viewBox="0 0 70 100" className="w-full h-full">
                                <defs><clipPath id="bClip"><path d="M 22 32 L 22 88 Q 22 92 28 92 L 42 92 Q 48 92 48 88 L 48 32 Q 48 25 42 20 L 28 20 Q 22 25 22 32 Z" /></clipPath></defs>
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

                    {/* Victory Message */}
                    {percentage >= 100 && (
                        <div className="absolute top-24 left-0 right-0 z-20 flex justify-center pointer-events-none">
                            <div className="bg-black/80 border border-white/50 rounded px-3 py-1 text-white font-[family-name:var(--font-dotgothic)] text-sm animate-bounce shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                スライムを やっつけた。
                            </div>
                        </div>
                    )}

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

                    {/* Water filling the widget - reaches up to bar at 100% */}
                    <div
                        className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out overflow-visible"
                        style={{ height: `${Math.min(percentage, 100) * 0.85}%` }}
                    >
                        {/* Multi-color liquid layers */}
                        <div className="absolute inset-0 flex flex-col-reverse">
                            {layers.map((layer, i) => {
                                const layerHeight = percentage > 0 ? (layer.height / percentage) * 100 : 0;
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            height: `${layerHeight}%`,
                                            backgroundColor: layer.color,
                                            opacity: 0.75,
                                        }}
                                    />
                                );
                            })}</div>

                        {/* Animated wave effect - at top of water surface */}
                        {percentage > 0 && (
                            <div className="absolute left-0 right-0 h-12 pointer-events-none" style={{ top: '-6px' }}>
                                {/* Wave layer 1 */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: `radial-gradient(ellipse 80% 60% at 20% 0%, ${layers[layers.length - 1]?.color || '#29B6F6'} 0%, transparent 70%),
                                                     radial-gradient(ellipse 60% 50% at 50% 0%, ${layers[layers.length - 1]?.color || '#29B6F6'} 0%, transparent 70%),
                                                     radial-gradient(ellipse 70% 55% at 80% 0%, ${layers[layers.length - 1]?.color || '#29B6F6'} 0%, transparent 70%)`,
                                        animation: 'waveBob1 2s ease-in-out infinite',
                                        opacity: 0.8,
                                    }}
                                />
                                {/* Wave layer 2 */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: `radial-gradient(ellipse 70% 50% at 35% 0%, ${layers[layers.length - 1]?.color || '#29B6F6'} 0%, transparent 70%),
                                                     radial-gradient(ellipse 80% 60% at 65% 0%, ${layers[layers.length - 1]?.color || '#29B6F6'} 0%, transparent 70%),
                                                     radial-gradient(ellipse 60% 45% at 95% 0%, ${layers[layers.length - 1]?.color || '#29B6F6'} 0%, transparent 70%)`,
                                        animation: 'waveBob2 2.5s ease-in-out infinite',
                                        opacity: 0.6,
                                    }}
                                />
                                {/* Wave layer 3 - highlights */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: `radial-gradient(ellipse 50% 40% at 25% 0%, rgba(255,255,255,0.35) 0%, transparent 70%),
                                                     radial-gradient(ellipse 40% 35% at 60% 0%, rgba(255,255,255,0.25) 0%, transparent 70%),
                                                     radial-gradient(ellipse 45% 38% at 85% 0%, rgba(255,255,255,0.3) 0%, transparent 70%)`,
                                        animation: 'waveBob3 3s ease-in-out infinite',
                                        opacity: 0.7,
                                    }}
                                />
                            </div>
                        )}

                        {/* Bubbles */}
                        {percentage > 20 && (
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute w-3 h-3 rounded-full bg-white/30 animate-bubble" style={{ left: '20%', animationDelay: '0s' }} />
                                <div className="absolute w-2 h-2 rounded-full bg-white/20 animate-bubble" style={{ left: '50%', animationDelay: '1s' }} />
                                <div className="absolute w-4 h-4 rounded-full bg-white/25 animate-bubble" style={{ left: '75%', animationDelay: '2s' }} />
                                <div className="absolute w-2 h-2 rounded-full bg-white/30 animate-bubble" style={{ left: '35%', animationDelay: '0.5s' }} />
                                <div className="absolute w-3 h-3 rounded-full bg-white/20 animate-bubble" style={{ left: '60%', animationDelay: '1.5s' }} />
                                <div className="absolute w-2 h-2 rounded-full bg-white/25 animate-bubble" style={{ left: '10%', animationDelay: '2.5s' }} />
                            </div>
                        )}

                        {/* Water shimmer/reflection */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, rgba(255,255,255,0.05) 100%)',
                                animation: 'shimmer 4s ease-in-out infinite',
                            }}
                        />
                    </div>

                    {/* Large Slime floating on top - centered */}
                    <div className="flex-1 flex items-center justify-center z-10 relative overflow-hidden">
                        <div className="relative flex items-center justify-center" style={{ width: '100%', height: '100%', maxWidth: '360px', maxHeight: '360px' }}>
                            {/* Float wrapper */}
                            <div style={{ animation: 'slimeFloat 3s ease-in-out infinite' }}>
                                {/* Squish wrapper */}
                                <div style={{ animation: 'slimeSquish 2.5s ease-in-out infinite', transformOrigin: 'center bottom' }}>
                                    {/* Wobble wrapper */}
                                    <div style={{ animation: 'slimeWobble 5s ease-in-out infinite' }}>
                                        <img
                                            src="/slime.png"
                                            alt="Slime"
                                            className="w-full h-full object-contain pointer-events-none"
                                            style={{
                                                filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.6))',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Victory sparkles */}
                            {percentage >= 100 && (
                                <>
                                    <span className="absolute -top-4 left-8 text-2xl animate-pulse">✨</span>
                                    <span className="absolute top-0 right-10 text-2xl animate-pulse" style={{ animationDelay: '0.3s' }}>⭐</span>
                                    <span className="absolute top-8 left-1/2 -translate-x-1/2 text-xl animate-bounce">🎉</span>
                                </>
                            )}
                        </div>

                        <style>{`
                            @keyframes slimeFloat {
                                0%, 100% { transform: translateY(0); }
                                50% { transform: translateY(-12px); }
                            }
                            @keyframes slimeSquish {
                                0%, 100% { transform: scaleX(1) scaleY(1); }
                                30% { transform: scaleX(1.04) scaleY(0.96); }
                                60% { transform: scaleX(0.96) scaleY(1.04); }
                            }
                            @keyframes slimeWobble {
                                0%, 100% { transform: rotate(0deg); }
                                25% { transform: rotate(2deg); }
                                75% { transform: rotate(-2deg); }
                            }
                            @keyframes waveBob1 {
                                0%, 100% { transform: translateY(0); }
                                50% { transform: translateY(-8px); }
                            }
                            @keyframes waveBob2 {
                                0%, 100% { transform: translateY(-4px); }
                                50% { transform: translateY(4px); }
                            }
                            @keyframes waveBob3 {
                                0%, 100% { transform: translateY(2px); }
                                50% { transform: translateY(-6px); }
                            }
                            @keyframes shimmer {
                                0%, 100% { opacity: 0.3; }
                                50% { opacity: 0.6; }
                            }
                            @keyframes bubble {
                                0% { bottom: -10%; opacity: 0; transform: translateX(0) scale(0.5); }
                                10% { opacity: 0.8; }
                                100% { bottom: 100%; opacity: 0; transform: translateX(20px) scale(1.2); }
                            }
                            .animate-bubble {
                                animation: bubble 4s ease-in-out infinite;
                            }
                        `}</style>
                    </div>

                    {/* Drink buttons */}
                    <div className="px-2 pb-2 flex-shrink-0 z-10">
                        <div className="grid grid-cols-8 gap-1">
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
                                onClick={undoLast}
                                disabled={data.history.length === 0}
                                className={`flex flex-col items-center p-1.5 bg-[#151515] border border-[#252525] rounded transition-all group ${data.history.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:border-yellow-500/50'}`}
                                title="1つ戻る"
                            >
                                <Undo2 size={16} className="text-gray-500 group-hover:text-yellow-400 transition-colors" />
                            </button>
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
