"use client";

import { useState, useEffect } from "react";
import { Trophy, Star, Zap, X, ChevronRight, Sparkles } from "lucide-react";
import { useGamification, BADGES, Badge } from "@/contexts/GamificationContext";

const RARITY_COLORS = {
    common: { bg: "from-gray-700/50 to-gray-800/50", border: "border-gray-600", text: "text-gray-400" },
    rare: { bg: "from-blue-700/50 to-blue-800/50", border: "border-blue-500", text: "text-blue-400" },
    epic: { bg: "from-purple-700/50 to-purple-800/50", border: "border-purple-500", text: "text-purple-400" },
    legendary: { bg: "from-yellow-600/50 to-orange-700/50", border: "border-yellow-500", text: "text-yellow-400" },
};

const RARITY_NAMES = {
    common: "コモン",
    rare: "レア",
    epic: "エピック",
    legendary: "レジェンド",
};

export default function AchievementsWidget() {
    const {
        totalXP,
        level,
        xpProgress,
        xpToNextLevel,
        unlockedBadges,
        lockedBadges,
        recentBadge,
        clearRecentBadge,
    } = useGamification();

    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<"overview" | "badges" | "detail">("overview");
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (recentBadge) {
            setShowUnlockAnimation(true);
            const timer = setTimeout(() => {
                setShowUnlockAnimation(false);
                clearRecentBadge();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [recentBadge, clearRecentBadge]);

    if (!mounted) return null;

    // Badge unlock animation overlay
    if (showUnlockAnimation && recentBadge) {
        const colors = RARITY_COLORS[recentBadge.rarity];
        return (
            <div className="h-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-purple-500/20 animate-pulse" />
                <div className="relative z-10 text-center">
                    <div className="animate-bounce mb-2">
                        <Sparkles className="w-8 h-8 text-yellow-400 mx-auto" />
                    </div>
                    <p className="text-[10px] text-yellow-400 font-bold mb-2">🎉 バッジ獲得！</p>
                    <div className={`text-4xl mb-2 animate-pulse`}>{recentBadge.icon}</div>
                    <p className="text-sm font-bold text-white mb-1">{recentBadge.name}</p>
                    <p className={`text-[9px] ${colors.text}`}>{RARITY_NAMES[recentBadge.rarity]}</p>
                    <p className="text-[8px] text-gray-500 mt-1">{recentBadge.description}</p>
                </div>
            </div>
        );
    }

    // Badge detail view
    if (mode === "detail" && selectedBadge) {
        const colors = RARITY_COLORS[selectedBadge.rarity];
        const isUnlocked = unlockedBadges.some(b => b.id === selectedBadge.id);

        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span className="flex items-center gap-1"><Trophy size={12} />バッジ詳細</span>
                    <button onClick={() => setMode("badges")} className="text-gray-500 hover:text-white"><X size={14} /></button>
                </div>
                <div className="flex-1 p-3 flex flex-col items-center justify-center">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${colors.bg} border-2 ${colors.border} flex items-center justify-center mb-3 ${!isUnlocked ? 'opacity-40 grayscale' : ''}`}>
                        <span className="text-4xl">{selectedBadge.icon}</span>
                    </div>
                    <p className="text-sm font-bold text-white mb-1">{selectedBadge.name}</p>
                    <p className={`text-[9px] ${colors.text} mb-2`}>{RARITY_NAMES[selectedBadge.rarity]}</p>
                    <p className="text-[10px] text-gray-400 text-center">{selectedBadge.description}</p>
                    {isUnlocked ? (
                        <p className="text-[9px] text-green-400 mt-2">✓ 獲得済み</p>
                    ) : (
                        <p className="text-[9px] text-gray-500 mt-2">🔒 未獲得</p>
                    )}
                </div>
            </div>
        );
    }

    // Badges list view
    if (mode === "badges") {
        const allBadges = [...unlockedBadges, ...lockedBadges];

        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span className="flex items-center gap-1"><Trophy size={12} />バッジ一覧</span>
                    <button onClick={() => setMode("overview")} className="text-gray-500 hover:text-white"><X size={14} /></button>
                </div>
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    <p className="text-[9px] text-gray-500 mb-2">{unlockedBadges.length}/{BADGES.length} 獲得済み</p>
                    <div className="grid grid-cols-4 gap-1.5">
                        {allBadges.map(badge => {
                            const isUnlocked = unlockedBadges.some(b => b.id === badge.id);
                            const colors = RARITY_COLORS[badge.rarity];

                            return (
                                <button
                                    key={badge.id}
                                    onClick={() => { setSelectedBadge(badge); setMode("detail"); }}
                                    className={`aspect-square rounded-lg bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center transition-transform hover:scale-105 ${!isUnlocked ? 'opacity-30 grayscale' : ''}`}
                                    title={badge.name}
                                >
                                    <span className="text-lg">{badge.icon}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Overview mode (default)
    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0 flex items-center justify-between">
                <span className="flex items-center gap-1"><Trophy size={12} />ACHIEVEMENTS</span>
                <span className="text-[9px] text-yellow-400">Lv.{level}</span>
            </div>
            <div className="flex-1 p-2 overflow-auto min-h-0 space-y-2">
                {/* Level & XP */}
                <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400" />
                            <span className="text-sm font-bold text-white">Lv.{level}</span>
                        </div>
                        <span className="text-[9px] text-purple-400">{totalXP.toLocaleString()} XP</span>
                    </div>
                    <div className="h-2 bg-[#333] rounded-full overflow-hidden mb-1">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, xpProgress)}%` }}
                        />
                    </div>
                    <p className="text-[8px] text-gray-500 text-right">次のレベルまで {xpToNextLevel.toLocaleString()} XP</p>
                </div>

                {/* Recent badges */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[9px] text-gray-500">獲得バッジ</p>
                        <button
                            onClick={() => setMode("badges")}
                            className="text-[8px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                        >
                            全て見る <ChevronRight size={10} />
                        </button>
                    </div>
                    {unlockedBadges.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                            {unlockedBadges.slice(0, 6).map(badge => {
                                const colors = RARITY_COLORS[badge.rarity];
                                return (
                                    <button
                                        key={badge.id}
                                        onClick={() => { setSelectedBadge(badge); setMode("detail"); }}
                                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center transition-transform hover:scale-110`}
                                        title={badge.name}
                                    >
                                        <span className="text-sm">{badge.icon}</span>
                                    </button>
                                );
                            })}
                            {unlockedBadges.length > 6 && (
                                <button
                                    onClick={() => setMode("badges")}
                                    className="w-8 h-8 rounded-lg bg-[#2a2a2a] border border-[#3a3a3a] flex items-center justify-center text-[9px] text-gray-400"
                                >
                                    +{unlockedBadges.length - 6}
                                </button>
                            )}
                        </div>
                    ) : (
                        <p className="text-[9px] text-gray-600 text-center py-2">まだバッジがありません</p>
                    )}
                </div>

                {/* Stats summary */}
                <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-[#1a1a1a] rounded-lg p-1.5 text-center">
                        <p className="text-lg font-bold text-cyan-400">{unlockedBadges.length}</p>
                        <p className="text-[7px] text-gray-500">バッジ獲得</p>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-1.5 text-center">
                        <p className="text-lg font-bold text-purple-400">{BADGES.length - unlockedBadges.length}</p>
                        <p className="text-[7px] text-gray-500">残りバッジ</p>
                    </div>
                </div>

                {/* Next badge hint */}
                {lockedBadges.length > 0 && (
                    <div className="bg-[#0a0a0a] rounded-lg p-2 border border-[#222]">
                        <p className="text-[8px] text-gray-500 mb-1">次のバッジ候補</p>
                        <div className="flex items-center gap-2">
                            <span className="text-lg opacity-50">{lockedBadges[0].icon}</span>
                            <div>
                                <p className="text-[10px] text-gray-400">{lockedBadges[0].name}</p>
                                <p className="text-[8px] text-gray-600">{lockedBadges[0].description}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
