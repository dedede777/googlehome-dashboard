"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Award, BookOpen, PenLine, MessageCircle, Headphones, X, ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie } from "recharts";

// Storage keys from other widgets
const FLASHCARD_KEY = "dashboard-flashcard-v2";
const DIARY_KEY = "dashboard-diary-v1";
const CONVERSATION_KEY = "dashboard-conversation-v1";
const SHADOWING_KEY = "dashboard-shadowing-v1";
const LEARNING_STATS_KEY = "dashboard-learning-stats-v1";

interface DailyActivity {
    date: string;
    flashcard: number;
    diary: number;
    conversation: number;
    shadowing: number;
    total: number;
}

interface LearningStatsData {
    dailyActivities: Record<string, DailyActivity>;
    lastUpdated: string;
}

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
    everyday: "#22d3ee",    // cyan
    phrasal: "#a78bfa",     // purple
    slang: "#fb923c",       // orange
    idiom: "#4ade80",       // green
    business: "#60a5fa",    // blue
    pronunciation: "#f472b6", // pink
    custom: "#fbbf24",      // yellow
};

export default function LearningStatsWidget() {
    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<"overview" | "weekly" | "category">("overview");
    const [weekOffset, setWeekOffset] = useState(0);

    // Stats from various widgets
    const [flashcardStats, setFlashcardStats] = useState({
        mastered: 0,
        learning: 0,
        total: 0,
        streak: 0,
        todayPracticed: 0,
        categoryProgress: {} as Record<string, { mastered: number; total: number }>
    });
    const [diaryStats, setDiaryStats] = useState({ entries: 0, streak: 0 });
    const [conversationStats, setConversationStats] = useState({ sessions: 0 });
    const [shadowingStats, setShadowingStats] = useState({ attempts: 0, mastered: 0, streak: 0 });
    const [weeklyData, setWeeklyData] = useState<DailyActivity[]>([]);

    useEffect(() => {
        setMounted(true);
        loadAllStats();
    }, []);

    useEffect(() => {
        if (mounted) {
            loadWeeklyData();
        }
    }, [mounted, weekOffset]);

    const loadAllStats = () => {
        // Load Flashcard stats
        const flashcardData = localStorage.getItem(FLASHCARD_KEY);
        if (flashcardData) {
            interface FlashcardProgress {
                level?: number;
            }
            const data = JSON.parse(flashcardData);
            const progress: Record<string, FlashcardProgress> = data.progress || {};
            const progressValues = Object.values(progress);
            const mastered = progressValues.filter((p) => (p.level ?? 0) >= 5).length;
            const learning = progressValues.filter((p) => {
                const level = p.level ?? 0;
                return level > 0 && level < 5;
            }).length;

            // Calculate category progress
            const categoryProgress: Record<string, { mastered: number; total: number }> = {};
            // We need to load original flashcard data to get categories
            // For now, use what we can get from progress

            const today = new Date().toDateString();
            const todayPracticed = data.dailyStats?.date === today ? data.dailyStats.practiced : 0;

            setFlashcardStats({
                mastered,
                learning,
                total: Object.keys(progress).length,
                streak: data.totalStreak || 0,
                todayPracticed,
                categoryProgress
            });
        }

        // Load Diary stats
        const diaryData = localStorage.getItem(DIARY_KEY);
        if (diaryData) {
            const data = JSON.parse(diaryData);
            setDiaryStats({
                entries: data.entries?.length || 0,
                streak: data.streak || 0
            });
        }

        // Load Conversation stats
        const conversationData = localStorage.getItem(CONVERSATION_KEY);
        if (conversationData) {
            const data = JSON.parse(conversationData);
            setConversationStats({
                sessions: data.sessionCount || 0
            });
        }

        // Load Shadowing stats
        const shadowingData = localStorage.getItem(SHADOWING_KEY);
        if (shadowingData) {
            interface ShadowingRecord {
                completed?: boolean;
            }
            const data = JSON.parse(shadowingData);
            const records: Record<string, ShadowingRecord> = data.records || {};
            const recordValues = Object.values(records);
            const mastered = recordValues.filter((r) => r.completed).length;
            setShadowingStats({
                attempts: data.totalAttempts || 0,
                mastered,
                streak: data.streak || 0
            });
        }

        loadWeeklyData();
    };

    const loadWeeklyData = () => {
        const statsData = localStorage.getItem(LEARNING_STATS_KEY);
        let activities: Record<string, DailyActivity> = {};

        if (statsData) {
            const data: LearningStatsData = JSON.parse(statsData);
            activities = data.dailyActivities || {};
        }

        // Generate past 7 days with offset
        const days: DailyActivity[] = [];
        const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i - (weekOffset * 7));
            const dateStr = date.toDateString();
            const dayName = dayNames[date.getDay()];

            const activity = activities[dateStr] || {
                date: dateStr,
                flashcard: 0,
                diary: 0,
                conversation: 0,
                shadowing: 0,
                total: 0
            };

            days.push({
                ...activity,
                date: dayName
            });
        }

        setWeeklyData(days);
    };

    // Update today's activity when stats change
    const updateTodayActivity = () => {
        const today = new Date().toDateString();
        const statsData = localStorage.getItem(LEARNING_STATS_KEY);
        let data: LearningStatsData = statsData
            ? JSON.parse(statsData)
            : { dailyActivities: {}, lastUpdated: today };

        const todayActivity: DailyActivity = {
            date: today,
            flashcard: flashcardStats.todayPracticed,
            diary: diaryStats.entries > 0 ? 1 : 0,
            conversation: conversationStats.sessions,
            shadowing: shadowingStats.attempts,
            total: flashcardStats.todayPracticed + (diaryStats.entries > 0 ? 1 : 0) + conversationStats.sessions + shadowingStats.attempts
        };

        data.dailyActivities[today] = todayActivity;
        data.lastUpdated = today;

        localStorage.setItem(LEARNING_STATS_KEY, JSON.stringify(data));
    };

    useEffect(() => {
        if (mounted) {
            updateTodayActivity();
        }
    }, [flashcardStats, diaryStats, conversationStats, shadowingStats, mounted]);

    // Calculate total streak (max of all streaks)
    const maxStreak = Math.max(flashcardStats.streak, diaryStats.streak, shadowingStats.streak);

    // Calculate total activities today
    const todayTotal = weeklyData.length > 0 ? weeklyData[weeklyData.length - 1]?.total || 0 : 0;

    // Calculate weekly total
    const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.total, 0);

    if (!mounted) return null;

    // Category view
    if (mode === "category") {
        // Mock category data for visualization
        const categoryData = [
            { name: "日常", value: 40, color: CATEGORY_COLORS.everyday },
            { name: "句動詞", value: 25, color: CATEGORY_COLORS.phrasal },
            { name: "スラング", value: 15, color: CATEGORY_COLORS.slang },
            { name: "イディオム", value: 12, color: CATEGORY_COLORS.idiom },
            { name: "ビジネス", value: 8, color: CATEGORY_COLORS.business },
        ];

        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span className="flex items-center gap-1"><Award size={12} />カテゴリ別</span>
                    <button onClick={() => setMode("overview")} className="text-gray-500 hover:text-white"><X size={14} /></button>
                </div>
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    <div className="h-32 mb-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={25}
                                    outerRadius={45}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        fontSize: '10px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-1">
                        {categoryData.map((cat, i) => (
                            <div key={i} className="flex items-center justify-between text-[9px]">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                    <span className="text-gray-400">{cat.name}</span>
                                </div>
                                <span className="text-gray-300">{cat.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Weekly view
    if (mode === "weekly") {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 6 - (weekOffset * 7));
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (weekOffset * 7));

        const weekLabel = weekOffset === 0 ? "今週" : `${Math.abs(weekOffset)}週間前`;

        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span className="flex items-center gap-1"><TrendingUp size={12} />週間推移</span>
                    <button onClick={() => setMode("overview")} className="text-gray-500 hover:text-white"><X size={14} /></button>
                </div>
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    {/* Week navigation */}
                    <div className="flex items-center justify-between mb-2">
                        <button
                            onClick={() => setWeekOffset(prev => prev + 1)}
                            className="p-1 text-gray-500 hover:text-white"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <span className="text-[9px] text-gray-400">{weekLabel}</span>
                        <button
                            onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
                            disabled={weekOffset === 0}
                            className={`p-1 ${weekOffset === 0 ? 'text-gray-700' : 'text-gray-500 hover:text-white'}`}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    {/* Chart */}
                    <div className="h-28 mb-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} barCategoryGap="20%">
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 8, fill: '#888' }}
                                    axisLine={{ stroke: '#333' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 8, fill: '#888' }}
                                    axisLine={{ stroke: '#333' }}
                                    tickLine={false}
                                    width={20}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        fontSize: '10px'
                                    }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                    {weeklyData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.total > 0 ? '#22d3ee' : '#333'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Weekly summary */}
                    <div className="bg-[#1a1a1a] rounded-lg p-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] text-gray-500">週間合計</span>
                            <span className="text-sm font-bold text-cyan-400">{weeklyTotal}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-[9px] text-gray-500">平均/日</span>
                            <span className="text-[10px] text-gray-300">{(weeklyTotal / 7).toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Overview mode (default)
    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0 flex items-center justify-between">
                <span className="flex items-center gap-1"><BarChart3 size={12} />LEARNING STATS</span>
                <span className="text-[9px] text-orange-400">🔥{maxStreak}</span>
            </div>
            <div className="flex-1 p-2 overflow-auto min-h-0 space-y-2">
                {/* Today's activity */}
                <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-2 text-center">
                    <p className="text-[8px] text-gray-500 mb-1">今日の学習</p>
                    <p className="text-xl font-bold text-cyan-400">{todayTotal}</p>
                </div>

                {/* Mini week chart */}
                <div className="h-16">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData} barCategoryGap="15%">
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 7, fill: '#666' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Bar dataKey="total" radius={[2, 2, 0, 0]}>
                                {weeklyData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === weeklyData.length - 1 ? '#22d3ee' : entry.total > 0 ? '#0e7490' : '#333'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Widget stats grid */}
                <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-[#1a1a1a] rounded p-1.5 flex items-center gap-1.5">
                        <BookOpen size={12} className="text-cyan-400" />
                        <div>
                            <p className="text-[10px] font-medium text-white">{flashcardStats.mastered}</p>
                            <p className="text-[7px] text-gray-500">マスター</p>
                        </div>
                    </div>
                    <div className="bg-[#1a1a1a] rounded p-1.5 flex items-center gap-1.5">
                        <PenLine size={12} className="text-green-400" />
                        <div>
                            <p className="text-[10px] font-medium text-white">{diaryStats.entries}</p>
                            <p className="text-[7px] text-gray-500">日記</p>
                        </div>
                    </div>
                    <div className="bg-[#1a1a1a] rounded p-1.5 flex items-center gap-1.5">
                        <MessageCircle size={12} className="text-purple-400" />
                        <div>
                            <p className="text-[10px] font-medium text-white">{conversationStats.sessions}</p>
                            <p className="text-[7px] text-gray-500">会話</p>
                        </div>
                    </div>
                    <div className="bg-[#1a1a1a] rounded p-1.5 flex items-center gap-1.5">
                        <Headphones size={12} className="text-orange-400" />
                        <div>
                            <p className="text-[10px] font-medium text-white">{shadowingStats.mastered}</p>
                            <p className="text-[7px] text-gray-500">発音</p>
                        </div>
                    </div>
                </div>

                {/* Quick links */}
                <div className="flex gap-1">
                    <button
                        onClick={() => setMode("weekly")}
                        className="flex-1 py-1.5 text-[8px] text-gray-400 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded flex items-center justify-center gap-1"
                    >
                        <TrendingUp size={10} />週間
                    </button>
                    <button
                        onClick={() => setMode("category")}
                        className="flex-1 py-1.5 text-[8px] text-gray-400 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded flex items-center justify-center gap-1"
                    >
                        <Award size={10} />カテゴリ
                    </button>
                </div>
            </div>
        </div>
    );
}
