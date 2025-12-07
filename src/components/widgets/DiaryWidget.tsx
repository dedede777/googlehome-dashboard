"use client";

import { useState, useEffect } from "react";
import { BookOpen, Send, Sparkles, Calendar, ChevronLeft, ChevronRight, X, Flame, CheckCircle2 } from "lucide-react";
import { useAISettings } from "@/contexts/AISettingsContext";
import { useGamification, XP_REWARDS } from "@/contexts/GamificationContext";

const STORAGE_KEY = "dashboard-diary-v1";

interface DiaryEntry {
    id: string;
    date: string;
    content: string;
    feedback?: string;
    isChecked: boolean;
    createdAt: number;
}

interface DiaryData {
    entries: DiaryEntry[];
    streak: number;
    lastWriteDate: string;
}

const PROMPTS = [
    "今日はどんな1日でしたか？",
    "今日学んだことは？",
    "今日の感謝を3つ書いてみましょう",
    "今日の挑戦について書いてみましょう",
    "週末の予定は？",
    "最近ハマっていることは？",
    "今日食べたものについて書いてみましょう",
    "最近見た映画やドラマについて",
    "将来の目標について書いてみましょう",
    "お気に入りの場所について書いてみましょう",
];

export default function DiaryWidget() {
    const { settings: aiSettings } = useAISettings();
    const { addXP, checkAndUnlockBadges } = useGamification();
    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<"write" | "history" | "view">("write");
    const [content, setContent] = useState("");
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [streak, setStreak] = useState(0);
    const [lastWriteDate, setLastWriteDate] = useState("");
    const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
    const [prompt, setPrompt] = useState("");
    const [todayChecked, setTodayChecked] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadData();
        // Random prompt
        setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    }, []);

    const loadData = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data: DiaryData = JSON.parse(saved);
            setEntries(data.entries || []);
            setStreak(data.streak || 0);
            setLastWriteDate(data.lastWriteDate || "");

            // Check if already wrote today
            const today = new Date().toDateString();
            const todayEntry = data.entries?.find(e => e.date === today);
            if (todayEntry) {
                setTodayChecked(todayEntry.isChecked);
            }

            // Check streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const wasYesterday = data.lastWriteDate === yesterday.toDateString();
            const isToday = data.lastWriteDate === today;

            if (!wasYesterday && !isToday) {
                // Streak broken
                setStreak(0);
                saveData({ entries: data.entries, streak: 0, lastWriteDate: data.lastWriteDate });
            }
        }
    };

    const saveData = (data: DiaryData) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    const countSentences = (text: string): number => {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        return sentences.length;
    };

    const submitDiary = async () => {
        const sentenceCount = countSentences(content);
        if (sentenceCount < 3) {
            setFeedback("❌ 3文以上書いてください！(現在: " + sentenceCount + "文)");
            return;
        }

        setLoading(true);
        setFeedback("");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `英語の先生として、生徒の英語日記を添削してください。

【生徒の日記】
${content}

以下の形式で回答してください（前置きなし）:
1. 総合評価（⭐1-5）
2. 文法チェック（各文に対して正誤とフィードバック）
3. より自然な表現の提案（もしあれば）
4. 良かった点・励ましの言葉（1-2文）

簡潔に、ポイントを絞って回答してください。`,
                    history: [],
                    provider: aiSettings.provider,
                    model: aiSettings.groqModel,
                })
            });

            const data = await res.json();
            if (data.response) {
                setFeedback(data.response);

                // Save entry
                const today = new Date().toDateString();
                const newEntry: DiaryEntry = {
                    id: Date.now().toString(),
                    date: today,
                    content: content,
                    feedback: data.response,
                    isChecked: true,
                    createdAt: Date.now()
                };

                // Update or add entry
                const existingIndex = entries.findIndex(e => e.date === today);
                let updatedEntries: DiaryEntry[];
                if (existingIndex >= 0) {
                    updatedEntries = [...entries];
                    updatedEntries[existingIndex] = newEntry;
                } else {
                    updatedEntries = [newEntry, ...entries];
                }

                // Update streak
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const wasYesterday = lastWriteDate === yesterday.toDateString();
                const isToday = lastWriteDate === today;

                let newStreak = streak;
                if (!isToday) {
                    newStreak = wasYesterday ? streak + 1 : 1;
                }

                setEntries(updatedEntries);
                setStreak(newStreak);
                setLastWriteDate(today);
                setTodayChecked(true);

                saveData({
                    entries: updatedEntries,
                    streak: newStreak,
                    lastWriteDate: today
                });

                // Gamification: Add XP and check badges
                addXP(XP_REWARDS.diary_submit, "diary_submit");
                addXP(XP_REWARDS.streak_bonus * newStreak, "streak_bonus");
                checkAndUnlockBadges({
                    diaryCount: updatedEntries.length,
                    diaryStreak: newStreak,
                    streak: newStreak
                });
            } else {
                setFeedback("エラーが発生しました。もう一度お試しください。");
            }
        } catch (error) {
            console.error(error);
            setFeedback("接続エラーが発生しました。");
        }
        setLoading(false);
    };

    const viewEntry = (entry: DiaryEntry) => {
        setSelectedEntry(entry);
        setMode("view");
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
        const weekday = weekdays[date.getDay()];
        return `${month}/${day}(${weekday})`;
    };

    if (!mounted) return null;

    // View single entry
    if (mode === "view" && selectedEntry) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(selectedEntry.date)}
                    </span>
                    <button onClick={() => setMode("history")} className="text-gray-500 hover:text-white">
                        <X size={14} />
                    </button>
                </div>
                <div className="flex-1 p-2 overflow-auto min-h-0 space-y-2">
                    <div className="bg-[#1a1a1a] rounded-lg p-2">
                        <p className="text-[9px] text-gray-500 mb-1">日記</p>
                        <p className="text-[11px] text-gray-300 whitespace-pre-wrap">{selectedEntry.content}</p>
                    </div>
                    {selectedEntry.feedback && (
                        <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-lg p-2 border border-cyan-800/30">
                            <p className="text-[9px] text-cyan-400 mb-1">AI添削</p>
                            <p className="text-[10px] text-gray-300 whitespace-pre-wrap">{selectedEntry.feedback}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // History mode
    if (mode === "history") {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        日記履歴
                    </span>
                    <button onClick={() => setMode("write")} className="text-gray-500 hover:text-white">
                        <X size={14} />
                    </button>
                </div>
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    {entries.length === 0 ? (
                        <div className="text-center text-gray-500 text-[10px] py-4">
                            まだ日記がありません
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {entries.map(entry => (
                                <button
                                    key={entry.id}
                                    onClick={() => viewEntry(entry)}
                                    className="w-full text-left p-2 bg-[#1a1a1a] hover:bg-[#222] rounded-lg transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] text-cyan-400 font-medium">{formatDate(entry.date)}</span>
                                        {entry.isChecked && <CheckCircle2 size={10} className="text-green-400" />}
                                    </div>
                                    <p className="text-[9px] text-gray-400 line-clamp-2">{entry.content}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Write mode (default)
    const sentenceCount = countSentences(content);
    const progress = Math.min(100, (sentenceCount / 3) * 100);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0 flex items-center justify-between">
                <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                    DIARY
                </span>
                <div className="flex items-center gap-2">
                    {streak > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px] text-orange-400">
                            <Flame size={10} />
                            {streak}
                        </span>
                    )}
                    <button onClick={() => setMode("history")} className="text-gray-500 hover:text-white" title="履歴">
                        <Calendar size={12} />
                    </button>
                </div>
            </div>

            {/* Progress indicator */}
            <div className="px-2 pt-1">
                <div className="flex items-center gap-2 text-[8px]">
                    <span className={sentenceCount >= 3 ? "text-green-400" : "text-gray-500"}>
                        {sentenceCount}/3文
                    </span>
                    <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all ${sentenceCount >= 3 ? "bg-green-500" : "bg-cyan-500"}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {todayChecked && <CheckCircle2 size={10} className="text-green-400" />}
                </div>
            </div>

            <div className="flex-1 p-2 overflow-auto min-h-0 flex flex-col">
                {/* Prompt */}
                <div className="text-center mb-2 py-1.5 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg">
                    <p className="text-[9px] text-gray-400">{prompt}</p>
                </div>

                {/* Text area */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your diary in English... (3+ sentences)"
                    className="flex-1 w-full p-2 text-[11px] bg-[#0a0a0a] border border-[#3a3a3a] rounded-lg resize-none focus:border-cyan-500 focus:outline-none mb-2"
                    disabled={loading}
                />

                {/* Submit button */}
                <button
                    onClick={submitDiary}
                    disabled={loading || sentenceCount < 3}
                    className="w-full py-2 text-[10px] text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 rounded-lg flex items-center justify-center gap-1 transition-all"
                >
                    {loading ? (
                        "添削中..."
                    ) : (
                        <>
                            <Sparkles size={12} />
                            AI添削を受ける
                        </>
                    )}
                </button>

                {/* Feedback */}
                {feedback && (
                    <div className={`mt-2 p-2 rounded-lg text-[10px] whitespace-pre-wrap max-h-32 overflow-auto ${feedback.startsWith("❌")
                        ? "bg-red-900/30 border border-red-700/50 text-red-300"
                        : "bg-gradient-to-br from-green-900/30 to-cyan-900/30 border border-green-700/30 text-gray-300"
                        }`}>
                        {feedback}
                    </div>
                )}
            </div>
        </div>
    );
}
