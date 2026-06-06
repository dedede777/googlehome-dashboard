"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// XP per action
export const XP_REWARDS = {
    flashcard_correct: 10,
    flashcard_incorrect: 2,
    flashcard_master: 50,
    diary_submit: 30,
    conversation_message: 5,
    conversation_session: 20,
    shadowing_attempt: 10,
    shadowing_master: 40,
    daily_goal: 25,
    streak_bonus: 15, // per streak day
};

// Level thresholds
const LEVEL_THRESHOLDS = [
    0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000,
    17000, 23000, 30000, 40000, 52000, 67000, 85000, 110000, 140000, 180000
];

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    unlockedAt?: number;
}

export const BADGES: Badge[] = [
    // Flashcard badges
    { id: "first_word", name: "はじめの一歩", description: "最初の単語を学習", icon: "📚", rarity: "common" },
    { id: "word_10", name: "語彙力アップ", description: "10単語マスター", icon: "📖", rarity: "common" },
    { id: "word_25", name: "ボキャビルダー", description: "25単語マスター", icon: "📗", rarity: "rare" },
    { id: "word_50", name: "ワードマスター", description: "50単語マスター", icon: "📕", rarity: "rare" },
    { id: "word_100", name: "語彙王", description: "100単語マスター", icon: "👑", rarity: "epic" },
    { id: "word_200", name: "レジェンド", description: "200単語マスター", icon: "🏆", rarity: "legendary" },

    // Diary badges
    { id: "first_diary", name: "日記デビュー", description: "最初の日記を書く", icon: "✏️", rarity: "common" },
    { id: "diary_7", name: "週間ライター", description: "7日間日記継続", icon: "📝", rarity: "rare" },
    { id: "diary_30", name: "日記マスター", description: "30日間日記継続", icon: "📓", rarity: "epic" },

    // Conversation badges
    { id: "first_chat", name: "会話スタート", description: "最初の会話練習", icon: "💬", rarity: "common" },
    { id: "chat_10", name: "おしゃべり", description: "10回会話練習", icon: "🗣️", rarity: "rare" },
    { id: "chat_50", name: "スピーカー", description: "50回会話練習", icon: "🎤", rarity: "epic" },

    // Shadowing badges
    { id: "first_shadow", name: "シャドーイング入門", description: "初めてのシャドーイング", icon: "🎧", rarity: "common" },
    { id: "shadow_10", name: "発音練習家", description: "10フレーズマスター", icon: "🎵", rarity: "rare" },
    { id: "shadow_30", name: "シャドーキング", description: "全30フレーズマスター", icon: "👂", rarity: "legendary" },

    // Streak badges
    { id: "streak_3", name: "三日坊主卒業", description: "3日連続ログイン", icon: "🔥", rarity: "common" },
    { id: "streak_7", name: "週間戦士", description: "7日連続ログイン", icon: "⚡", rarity: "rare" },
    { id: "streak_14", name: "二週間の強者", description: "14日連続ログイン", icon: "💪", rarity: "rare" },
    { id: "streak_30", name: "月間チャンピオン", description: "30日連続ログイン", icon: "🌟", rarity: "epic" },
    { id: "streak_100", name: "伝説の継続者", description: "100日連続ログイン", icon: "🌈", rarity: "legendary" },

    // Level badges
    { id: "level_5", name: "見習い", description: "レベル5到達", icon: "🌱", rarity: "common" },
    { id: "level_10", name: "学習者", description: "レベル10到達", icon: "🌿", rarity: "rare" },
    { id: "level_15", name: "熟練者", description: "レベル15到達", icon: "🌳", rarity: "epic" },
    { id: "level_20", name: "マスター", description: "レベル20到達", icon: "🏔️", rarity: "legendary" },

    // Special badges
    { id: "early_bird", name: "早起き鳥", description: "朝6時前に学習", icon: "🐦", rarity: "rare" },
    { id: "night_owl", name: "夜更かしフクロウ", description: "深夜0時以降に学習", icon: "🦉", rarity: "rare" },
    { id: "perfectionist", name: "完璧主義者", description: "1日で目標の200%達成", icon: "💎", rarity: "epic" },
];

interface GamificationData {
    totalXP: number;
    level: number;
    unlockedBadges: string[];
    lastActivityDate: string;
    dailyXP: number;
    weeklyXP: number[];
}

interface GamificationContextType {
    totalXP: number;
    level: number;
    xpToNextLevel: number;
    xpProgress: number;
    unlockedBadges: Badge[];
    lockedBadges: Badge[];
    recentBadge: Badge | null;
    addXP: (amount: number, action?: string) => void;
    unlockBadge: (badgeId: string) => void;
    checkAndUnlockBadges: (stats: GameStats) => void;
    clearRecentBadge: () => void;
}

export interface GameStats {
    masteredWords?: number;
    diaryStreak?: number;
    diaryCount?: number;
    conversationCount?: number;
    shadowingMastered?: number;
    streak?: number;
    dailyGoalReached?: boolean;
}

const STORAGE_KEY = "dashboard-gamification-v1";

const DEFAULT_DATA: GamificationData = {
    totalXP: 0,
    level: 1,
    unlockedBadges: [],
    lastActivityDate: "",
    dailyXP: 0,
    weeklyXP: [0, 0, 0, 0, 0, 0, 0],
};

const GamificationContext = createContext<GamificationContextType | null>(null);

function loadInitialData(): GamificationData {
    if (typeof window === "undefined") return DEFAULT_DATA;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_DATA;

    try {
        return { ...DEFAULT_DATA, ...JSON.parse(saved) };
    } catch {
        return DEFAULT_DATA;
    }
}

export function GamificationProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<GamificationData>(loadInitialData);
    const [recentBadge, setRecentBadge] = useState<Badge | null>(null);

    const applyBadgeUnlocks = (currentData: GamificationData, badgeIds: string[]) => {
        const nextUnlockedBadges = [...currentData.unlockedBadges];
        let newestBadge: Badge | null = null;
        const unlockedAt = Date.now();

        badgeIds.forEach((badgeId) => {
            if (nextUnlockedBadges.includes(badgeId)) return;

            const badge = BADGES.find(b => b.id === badgeId);
            if (!badge) return;

            nextUnlockedBadges.push(badgeId);
            newestBadge = { ...badge, unlockedAt };
        });

        return {
            nextData: {
                ...currentData,
                unlockedBadges: nextUnlockedBadges,
            },
            newestBadge,
        };
    };

    const saveData = (newData: GamificationData) => {
        setData(newData);
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        }
    };

    const calculateLevel = (xp: number): number => {
        for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (xp >= LEVEL_THRESHOLDS[i]) {
                return i + 1;
            }
        }
        return 1;
    };

    const addXP = (amount: number) => {
        const today = new Date().toDateString();
        const isNewDay = data.lastActivityDate !== today;

        const newTotalXP = data.totalXP + amount;
        const newLevel = calculateLevel(newTotalXP);
        const newDailyXP = isNewDay ? amount : data.dailyXP + amount;

        // Update weekly XP
        const dayOfWeek = new Date().getDay();
        const newWeeklyXP = [...data.weeklyXP];
        if (isNewDay) {
            newWeeklyXP[dayOfWeek] = amount;
        } else {
            newWeeklyXP[dayOfWeek] = (newWeeklyXP[dayOfWeek] || 0) + amount;
        }

        const newData = {
            ...data,
            totalXP: newTotalXP,
            level: newLevel,
            lastActivityDate: today,
            dailyXP: newDailyXP,
            weeklyXP: newWeeklyXP,
        };

        const badgeIdsToUnlock: string[] = [];

        // Check for level badges
        if (newLevel >= 5) badgeIdsToUnlock.push("level_5");
        if (newLevel >= 10) badgeIdsToUnlock.push("level_10");
        if (newLevel >= 15) badgeIdsToUnlock.push("level_15");
        if (newLevel >= 20) badgeIdsToUnlock.push("level_20");

        // Check time-based badges
        const hour = new Date().getHours();
        if (hour < 6) badgeIdsToUnlock.push("early_bird");
        if (hour >= 0 && hour < 4) badgeIdsToUnlock.push("night_owl");

        const { nextData, newestBadge } = applyBadgeUnlocks(newData, badgeIdsToUnlock);
        saveData(nextData);
        if (newestBadge) setRecentBadge(newestBadge);
    };

    const unlockBadge = (badgeId: string) => {
        const { nextData, newestBadge } = applyBadgeUnlocks(data, [badgeId]);
        if (nextData.unlockedBadges.length === data.unlockedBadges.length) return;

        saveData(nextData);
        if (newestBadge) setRecentBadge(newestBadge);
    };

    const checkAndUnlockBadges = (stats: GameStats) => {
        const badgeIdsToUnlock: string[] = [];

        // Flashcard badges
        if (stats.masteredWords !== undefined) {
            if (stats.masteredWords >= 1) badgeIdsToUnlock.push("first_word");
            if (stats.masteredWords >= 10) badgeIdsToUnlock.push("word_10");
            if (stats.masteredWords >= 25) badgeIdsToUnlock.push("word_25");
            if (stats.masteredWords >= 50) badgeIdsToUnlock.push("word_50");
            if (stats.masteredWords >= 100) badgeIdsToUnlock.push("word_100");
            if (stats.masteredWords >= 200) badgeIdsToUnlock.push("word_200");
        }

        // Diary badges
        if (stats.diaryCount !== undefined) {
            if (stats.diaryCount >= 1) badgeIdsToUnlock.push("first_diary");
        }
        if (stats.diaryStreak !== undefined) {
            if (stats.diaryStreak >= 7) badgeIdsToUnlock.push("diary_7");
            if (stats.diaryStreak >= 30) badgeIdsToUnlock.push("diary_30");
        }

        // Conversation badges
        if (stats.conversationCount !== undefined) {
            if (stats.conversationCount >= 1) badgeIdsToUnlock.push("first_chat");
            if (stats.conversationCount >= 10) badgeIdsToUnlock.push("chat_10");
            if (stats.conversationCount >= 50) badgeIdsToUnlock.push("chat_50");
        }

        // Shadowing badges
        if (stats.shadowingMastered !== undefined) {
            if (stats.shadowingMastered >= 1) badgeIdsToUnlock.push("first_shadow");
            if (stats.shadowingMastered >= 10) badgeIdsToUnlock.push("shadow_10");
            if (stats.shadowingMastered >= 30) badgeIdsToUnlock.push("shadow_30");
        }

        // Streak badges
        if (stats.streak !== undefined) {
            if (stats.streak >= 3) badgeIdsToUnlock.push("streak_3");
            if (stats.streak >= 7) badgeIdsToUnlock.push("streak_7");
            if (stats.streak >= 14) badgeIdsToUnlock.push("streak_14");
            if (stats.streak >= 30) badgeIdsToUnlock.push("streak_30");
            if (stats.streak >= 100) badgeIdsToUnlock.push("streak_100");
        }

        const { nextData, newestBadge } = applyBadgeUnlocks(data, badgeIdsToUnlock);
        if (nextData.unlockedBadges.length === data.unlockedBadges.length) return;

        saveData(nextData);
        if (newestBadge) setRecentBadge(newestBadge);
    };

    const clearRecentBadge = () => {
        setRecentBadge(null);
    };

    // Calculate XP progress
    const currentLevelXP = LEVEL_THRESHOLDS[data.level - 1] || 0;
    const nextLevelXP = LEVEL_THRESHOLDS[data.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const xpToNextLevel = nextLevelXP - data.totalXP;
    const xpProgress = ((data.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    const unlockedBadges = BADGES.filter(b => data.unlockedBadges.includes(b.id));
    const lockedBadges = BADGES.filter(b => !data.unlockedBadges.includes(b.id));

    return (
        <GamificationContext.Provider value={{
            totalXP: data.totalXP,
            level: data.level,
            xpToNextLevel,
            xpProgress,
            unlockedBadges,
            lockedBadges,
            recentBadge,
            addXP,
            unlockBadge,
            checkAndUnlockBadges,
            clearRecentBadge,
        }}>
            {children}
        </GamificationContext.Provider>
    );
}

export function useGamification() {
    const context = useContext(GamificationContext);
    if (!context) {
        return {
            totalXP: 0,
            level: 1,
            xpToNextLevel: 100,
            xpProgress: 0,
            unlockedBadges: [],
            lockedBadges: BADGES,
            recentBadge: null,
            addXP: () => { },
            unlockBadge: () => { },
            checkAndUnlockBadges: () => { },
            clearRecentBadge: () => { },
        };
    }
    return context;
}
