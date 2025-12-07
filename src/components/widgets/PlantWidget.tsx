"use client";

import { useState, useEffect } from "react";
import { Droplets, Sun, Sparkles, Heart, Star } from "lucide-react";

const STORAGE_KEY = "dashboard-virtual-plant";

interface PlantData {
    exp: number;
    level: number;
    lastWatered: string | null;
    lastSunlight: string | null;
    lastPetted: string | null;
    name: string;
    createdAt: string;
    mood: "happy" | "neutral" | "sad";
    totalPets: number;
}

const PLANT_STAGES = [
    { name: "種", minExp: 0, maxExp: 10 },
    { name: "芽", minExp: 10, maxExp: 30 },
    { name: "若葉", minExp: 30, maxExp: 70 },
    { name: "成長中", minExp: 70, maxExp: 150 },
    { name: "花つぼみ", minExp: 150, maxExp: 250 },
    { name: "満開", minExp: 250, maxExp: Infinity },
];

const MOODS = {
    happy: { emoji: "😊", message: "ご機嫌！" },
    neutral: { emoji: "😐", message: "普通" },
    sad: { emoji: "😢", message: "寂しい..." },
};

const MESSAGES = [
    "今日も元気だよ！",
    "お水ありがとう！",
    "日光浴気持ちいい♪",
    "なでなで嬉しい！",
    "大きくなったよ！",
    "一緒にいてくれてありがとう",
    "今日も頑張ろう！",
    "ぽかぽか〜",
];

const getStage = (exp: number) => {
    for (let i = PLANT_STAGES.length - 1; i >= 0; i--) {
        if (exp >= PLANT_STAGES[i].minExp) return i;
    }
    return 0;
};

const getProgressInStage = (exp: number) => {
    const stage = getStage(exp);
    const current = PLANT_STAGES[stage];
    if (current.maxExp === Infinity) return 100;
    const progress = ((exp - current.minExp) / (current.maxExp - current.minExp)) * 100;
    return Math.min(100, progress);
};

export default function PlantWidget() {
    const [data, setData] = useState<PlantData>({
        exp: 0,
        level: 0,
        lastWatered: null,
        lastSunlight: null,
        lastPetted: null,
        name: "マイプラント",
        createdAt: new Date().toISOString(),
        mood: "neutral",
        totalPets: 0,
    });
    const [mounted, setMounted] = useState(false);
    const [showSparkle, setShowSparkle] = useState(false);
    const [waterAnimation, setWaterAnimation] = useState(false);
    const [sunAnimation, setSunAnimation] = useState(false);
    const [isDancing, setIsDancing] = useState(false);
    const [showHearts, setShowHearts] = useState(false);
    const [showMessage, setShowMessage] = useState<string | null>(null);
    const [showStars, setShowStars] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge with defaults to handle missing properties from old data
                setData(prev => ({
                    ...prev,
                    ...parsed,
                    mood: parsed.mood || "neutral",
                    totalPets: parsed.totalPets || 0,
                }));
            } catch {
                // Ignore parse errors
            }
        }
    }, []);

    // Update mood based on care
    useEffect(() => {
        if (!mounted) return;
        const today = new Date().toDateString();
        const wasWatered = data.lastWatered === today;
        const wasSunlit = data.lastSunlight === today;
        const wasPetted = data.lastPetted === today;

        let newMood: "happy" | "neutral" | "sad" = "neutral";
        if (wasWatered && wasSunlit && wasPetted) {
            newMood = "happy";
        } else if (!wasWatered && !wasSunlit) {
            newMood = "sad";
        }

        if (newMood !== data.mood) {
            saveData({ ...data, mood: newMood });
        }
    }, [data.lastWatered, data.lastSunlight, data.lastPetted, mounted]);

    const saveData = (newData: PlantData) => {
        setData(newData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    };

    const today = new Date().toDateString();
    const canWater = data.lastWatered !== today;
    const canSunlight = data.lastSunlight !== today;

    const water = () => {
        if (!canWater) return;
        const newExp = data.exp + 5;
        const newStage = getStage(newExp);
        const oldStage = getStage(data.exp);

        setWaterAnimation(true);
        setTimeout(() => setWaterAnimation(false), 1000);

        if (newStage > oldStage) {
            setShowSparkle(true);
            setShowStars(true);
            setTimeout(() => { setShowSparkle(false); setShowStars(false); }, 2000);
        }

        showRandomMessage();
        saveData({ ...data, exp: newExp, level: newStage, lastWatered: today });
    };

    const sunlight = () => {
        if (!canSunlight) return;
        const newExp = data.exp + 5;
        const newStage = getStage(newExp);
        const oldStage = getStage(data.exp);

        setSunAnimation(true);
        setTimeout(() => setSunAnimation(false), 1000);

        if (newStage > oldStage) {
            setShowSparkle(true);
            setShowStars(true);
            setTimeout(() => { setShowSparkle(false); setShowStars(false); }, 2000);
        }

        showRandomMessage();
        saveData({ ...data, exp: newExp, level: newStage, lastSunlight: today });
    };

    const petPlant = () => {
        setIsDancing(true);
        setShowHearts(true);

        setTimeout(() => setIsDancing(false), 1500);
        setTimeout(() => setShowHearts(false), 2000);

        const newPets = data.totalPets + 1;
        const bonusExp = newPets % 10 === 0 ? 3 : 0; // Bonus every 10 pets

        showRandomMessage();
        saveData({
            ...data,
            totalPets: newPets,
            lastPetted: today,
            exp: data.exp + bonusExp
        });
    };

    const showRandomMessage = () => {
        const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
        setShowMessage(msg);
        setTimeout(() => setShowMessage(null), 2500);
    };

    const stage = getStage(data.exp);
    const progress = getProgressInStage(data.exp);
    const stageName = PLANT_STAGES[stage].name;
    const moodInfo = MOODS[data.mood] || MOODS.neutral;

    if (!mounted) return null;

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-[#1a2518] to-[#0a0a0a]">
            {/* Header */}
            <div className="widget-title flex-shrink-0 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                    <span className="text-green-400">🌱</span>
                    PLANT
                </span>
                <span className="text-[10px]" title={moodInfo.message}>{moodInfo.emoji}</span>
            </div>

            <div className="flex-1 flex flex-col min-h-0 p-2">
                {/* Stats */}
                <div className="text-center flex-shrink-0">
                    <div className="text-lg font-bold text-green-400">{stageName}</div>
                    <div className="flex items-center justify-center gap-2 text-[9px] text-gray-500">
                        <span>EXP: {data.exp}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                            <Heart size={8} className="text-pink-400" />
                            {data.totalPets}
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full mt-1 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Plant Display - Clickable! */}
                <div
                    className="flex-1 flex items-center justify-center overflow-visible relative cursor-pointer select-none"
                    onClick={petPlant}
                >
                    {/* Message bubble */}
                    {showMessage && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white/90 text-gray-800 px-2 py-1 rounded-full text-[9px] z-20 whitespace-nowrap animate-fade-in">
                            {showMessage}
                        </div>
                    )}

                    {/* Floating hearts */}
                    {showHearts && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                            {[...Array(3)].map((_, i) => (
                                <Heart
                                    key={i}
                                    size={10}
                                    className="absolute text-pink-400 opacity-80"
                                    style={{
                                        left: `${30 + i * 20}%`,
                                        top: `${35 + (i % 2) * 15}%`,
                                        animation: `float-up 1.5s ease-out forwards`,
                                        animationDelay: `${i * 0.2}s`,
                                    }}
                                    fill="currentColor"
                                />
                            ))}
                        </div>
                    )}

                    {/* Stars effect */}
                    {showStars && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                            {[...Array(3)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={8}
                                    className="absolute text-yellow-400 opacity-70"
                                    style={{
                                        left: `${25 + i * 25}%`,
                                        top: `${25 + (i % 2) * 20}%`,
                                        animation: `twinkle 1s ease-in-out`,
                                        animationDelay: `${i * 0.2}s`,
                                    }}
                                    fill="currentColor"
                                />
                            ))}
                        </div>
                    )}

                    <svg
                        viewBox="0 0 120 140"
                        className="w-32 h-36 transition-transform"
                        style={{ overflow: "visible" }}
                    >
                        <style>{`
                            @keyframes sway { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
                            @keyframes gentle-wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
                            @keyframes float-up { 0% { opacity: 0.8; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-30px); } }
                            @keyframes twinkle { 0%, 100% { opacity: 0; transform: scale(0.5); } 50% { opacity: 0.8; transform: scale(1); } }
                            @keyframes fade-in { 0% { opacity: 0; transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } }
                            .plant-sway { animation: sway 4s ease-in-out infinite; transform-origin: bottom center; }
                            .plant-dance { animation: gentle-wiggle 0.6s ease-in-out 3; transform-origin: bottom center; }
                            .animate-fade-in { animation: fade-in 0.3s ease-out; }
                        `}</style>

                        {/* Pot */}
                        <path d="M 35 110 L 40 130 Q 42 135 60 135 Q 78 135 80 130 L 85 110 Q 85 105 60 105 Q 35 105 35 110 Z"
                            fill="#8B4513" />
                        <ellipse cx="60" cy="107" rx="26" ry="6" fill="#A0522D" />
                        <ellipse cx="60" cy="107" rx="20" ry="4" fill="#5D4037" />

                        {/* Plant based on stage */}
                        <g className={isDancing ? "plant-dance" : "plant-sway"}>
                            {stage === 0 && (
                                /* Seed */
                                <ellipse cx="60" cy="102" rx="6" ry="4" fill="#8B7355" />
                            )}

                            {stage === 1 && (
                                /* Sprout */
                                <>
                                    <path d="M 60 100 L 60 85" stroke="#228B22" strokeWidth="3" strokeLinecap="round" />
                                    <ellipse cx="55" cy="82" rx="8" ry="5" fill="#32CD32" transform="rotate(-30 55 82)" />
                                    <ellipse cx="65" cy="82" rx="8" ry="5" fill="#32CD32" transform="rotate(30 65 82)" />
                                </>
                            )}

                            {stage === 2 && (
                                /* Young plant */
                                <>
                                    <path d="M 60 100 L 60 70" stroke="#228B22" strokeWidth="4" strokeLinecap="round" />
                                    <ellipse cx="50" cy="75" rx="12" ry="7" fill="#32CD32" transform="rotate(-40 50 75)" />
                                    <ellipse cx="70" cy="75" rx="12" ry="7" fill="#32CD32" transform="rotate(40 70 75)" />
                                    <ellipse cx="55" cy="85" rx="10" ry="6" fill="#3CB371" transform="rotate(-25 55 85)" />
                                    <ellipse cx="65" cy="85" rx="10" ry="6" fill="#3CB371" transform="rotate(25 65 85)" />
                                </>
                            )}

                            {stage === 3 && (
                                /* Growing plant */
                                <>
                                    <path d="M 60 100 L 60 55" stroke="#228B22" strokeWidth="5" strokeLinecap="round" />
                                    <ellipse cx="45" cy="65" rx="15" ry="8" fill="#32CD32" transform="rotate(-45 45 65)" />
                                    <ellipse cx="75" cy="65" rx="15" ry="8" fill="#32CD32" transform="rotate(45 75 65)" />
                                    <ellipse cx="50" cy="80" rx="12" ry="7" fill="#3CB371" transform="rotate(-30 50 80)" />
                                    <ellipse cx="70" cy="80" rx="12" ry="7" fill="#3CB371" transform="rotate(30 70 80)" />
                                    <ellipse cx="55" cy="92" rx="10" ry="6" fill="#2E8B57" transform="rotate(-20 55 92)" />
                                    <ellipse cx="65" cy="92" rx="10" ry="6" fill="#2E8B57" transform="rotate(20 65 92)" />
                                </>
                            )}

                            {stage === 4 && (
                                /* Bud */
                                <>
                                    <path d="M 60 100 L 60 45" stroke="#228B22" strokeWidth="5" strokeLinecap="round" />
                                    <ellipse cx="45" cy="60" rx="15" ry="8" fill="#32CD32" transform="rotate(-45 45 60)" />
                                    <ellipse cx="75" cy="60" rx="15" ry="8" fill="#32CD32" transform="rotate(45 75 60)" />
                                    <ellipse cx="50" cy="75" rx="12" ry="7" fill="#3CB371" transform="rotate(-30 50 75)" />
                                    <ellipse cx="70" cy="75" rx="12" ry="7" fill="#3CB371" transform="rotate(30 70 75)" />
                                    <ellipse cx="55" cy="88" rx="10" ry="6" fill="#2E8B57" transform="rotate(-20 55 88)" />
                                    <ellipse cx="65" cy="88" rx="10" ry="6" fill="#2E8B57" transform="rotate(20 65 88)" />
                                    {/* Bud */}
                                    <ellipse cx="60" cy="40" rx="10" ry="12" fill="#90EE90" />
                                    <path d="M 55 38 Q 60 32 65 38" fill="#FFB6C1" />
                                </>
                            )}

                            {stage >= 5 && (
                                /* Full bloom */
                                <>
                                    <path d="M 60 100 L 60 40" stroke="#228B22" strokeWidth="5" strokeLinecap="round" />
                                    <ellipse cx="45" cy="55" rx="15" ry="8" fill="#32CD32" transform="rotate(-45 45 55)" />
                                    <ellipse cx="75" cy="55" rx="15" ry="8" fill="#32CD32" transform="rotate(45 75 55)" />
                                    <ellipse cx="50" cy="70" rx="12" ry="7" fill="#3CB371" transform="rotate(-30 50 70)" />
                                    <ellipse cx="70" cy="70" rx="12" ry="7" fill="#3CB371" transform="rotate(30 70 70)" />
                                    <ellipse cx="55" cy="85" rx="10" ry="6" fill="#2E8B57" transform="rotate(-20 55 85)" />
                                    <ellipse cx="65" cy="85" rx="10" ry="6" fill="#2E8B57" transform="rotate(20 65 85)" />
                                    {/* Flower */}
                                    <circle cx="60" cy="28" r="5" fill="#FFD700" />
                                    <ellipse cx="60" cy="18" rx="6" ry="10" fill="#FF69B4" />
                                    <ellipse cx="50" cy="25" rx="6" ry="10" fill="#FF69B4" transform="rotate(-72 50 25)" />
                                    <ellipse cx="53" cy="35" rx="6" ry="10" fill="#FF69B4" transform="rotate(-144 53 35)" />
                                    <ellipse cx="67" cy="35" rx="6" ry="10" fill="#FF69B4" transform="rotate(144 67 35)" />
                                    <ellipse cx="70" cy="25" rx="6" ry="10" fill="#FF69B4" transform="rotate(72 70 25)" />
                                    <circle cx="60" cy="28" r="6" fill="#FFD700" />
                                    {/* Musical notes when happy */}
                                    {data.mood === "happy" && (
                                        <>
                                            <text x="85" y="25" fontSize="12" className="animate-bounce" style={{ animationDuration: "2s" }}>♪</text>
                                            <text x="30" y="35" fontSize="10" className="animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}>♫</text>
                                        </>
                                    )}
                                </>
                            )}
                        </g>

                        {/* Water animation */}
                        {waterAnimation && (
                            <>
                                <circle cx="50" cy="70" r="3" fill="#4FC3F7" opacity="0.8">
                                    <animate attributeName="cy" from="50" to="100" dur="1s" />
                                    <animate attributeName="opacity" from="0.8" to="0" dur="1s" />
                                </circle>
                                <circle cx="60" cy="65" r="3" fill="#4FC3F7" opacity="0.8">
                                    <animate attributeName="cy" from="45" to="100" dur="1.2s" />
                                    <animate attributeName="opacity" from="0.8" to="0" dur="1.2s" />
                                </circle>
                                <circle cx="70" cy="70" r="3" fill="#4FC3F7" opacity="0.8">
                                    <animate attributeName="cy" from="50" to="100" dur="0.9s" />
                                    <animate attributeName="opacity" from="0.8" to="0" dur="0.9s" />
                                </circle>
                            </>
                        )}

                        {/* Sun animation */}
                        {sunAnimation && (
                            <g>
                                <circle cx="100" cy="20" r="15" fill="#FFD700" opacity="0.6">
                                    <animate attributeName="r" values="15;20;15" dur="1s" />
                                    <animate attributeName="opacity" values="0.6;0.9;0.6" dur="1s" />
                                </circle>
                                <g stroke="#FFD700" strokeWidth="2" opacity="0.5">
                                    <line x1="100" y1="0" x2="100" y2="-10">
                                        <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" />
                                    </line>
                                    <line x1="115" y1="5" x2="122" y2="-2" />
                                    <line x1="120" y1="20" x2="130" y2="20" />
                                </g>
                            </g>
                        )}
                    </svg>

                    {/* Level up sparkle */}
                    {showSparkle && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Sparkles className="text-yellow-400 w-12 h-12 animate-ping" />
                        </div>
                    )}

                    {/* Tap hint */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] text-gray-600">
                        タップでなでる 💕
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 flex-shrink-0">
                    <button
                        onClick={water}
                        disabled={!canWater}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded text-[10px] transition-all ${canWater
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-[#252525] text-gray-600 cursor-not-allowed"
                            }`}
                    >
                        <Droplets size={14} />
                        {canWater ? "水やり" : "済み ✓"}
                    </button>
                    <button
                        onClick={sunlight}
                        disabled={!canSunlight}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded text-[10px] transition-all ${canSunlight
                            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                            : "bg-[#252525] text-gray-600 cursor-not-allowed"
                            }`}
                    >
                        <Sun size={14} />
                        {canSunlight ? "日光浴" : "済み ✓"}
                    </button>
                </div>
            </div>
        </div>
    );
}
