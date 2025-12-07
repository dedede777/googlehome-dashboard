"use client";

import { useState, useEffect, useRef } from "react";
import { Headphones, Volume2, Mic, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, CheckCircle2, X, Trophy, RefreshCw, Target } from "lucide-react";
import { useGamification, XP_REWARDS } from "@/contexts/GamificationContext";

const STORAGE_KEY = "dashboard-shadowing-v1";

// Levenshtein距離を計算する関数
const calculateLevenshtein = (a: string, b: string): number => {
    const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[a.length][b.length];
};

// 発音スコアを計算する関数
const calculatePronunciationScore = (original: string, recognized: string): number => {
    const normalizedOriginal = original.toLowerCase().replace(/[.,!?'"]/g, "").trim();
    const normalizedRecognized = recognized.toLowerCase().replace(/[.,!?'"]/g, "").trim();

    if (normalizedOriginal === normalizedRecognized) return 100;
    if (normalizedRecognized.length === 0) return 0;

    const distance = calculateLevenshtein(normalizedOriginal, normalizedRecognized);
    const maxLen = Math.max(normalizedOriginal.length, normalizedRecognized.length);
    const score = Math.round((1 - distance / maxLen) * 100);
    return Math.max(0, score);
};

// スコアに基づいてフィードバックを取得
const getScoreFeedback = (score: number): { message: string; color: string; emoji: string } => {
    if (score >= 90) return { message: "完璧！", color: "text-green-400", emoji: "🎉" };
    if (score >= 70) return { message: "いい感じ！", color: "text-cyan-400", emoji: "👍" };
    if (score >= 50) return { message: "もう少し！", color: "text-yellow-400", emoji: "💪" };
    return { message: "もう一度挑戦！", color: "text-red-400", emoji: "🔄" };
};

interface PronunciationResult {
    transcript: string;
    score: number;
    confidence: number;
}

interface ShadowingPhrase {
    id: string;
    text: string;
    translation: string;
    category: string;
    level: number; // 1-3 difficulty
}

const PHRASES: ShadowingPhrase[] = [
    // Level 1 - Short & Simple
    { id: "1", text: "Nice to meet you.", translation: "はじめまして。", category: "greeting", level: 1 },
    { id: "2", text: "How are you doing?", translation: "調子はどう？", category: "greeting", level: 1 },
    { id: "3", text: "That sounds great!", translation: "いいね！", category: "response", level: 1 },
    { id: "4", text: "Let me think about it.", translation: "考えさせて。", category: "thinking", level: 1 },
    { id: "5", text: "What do you think?", translation: "どう思う？", category: "question", level: 1 },
    { id: "6", text: "I'm not sure yet.", translation: "まだわからない。", category: "response", level: 1 },
    { id: "7", text: "Could you repeat that?", translation: "もう一度言ってもらえますか？", category: "request", level: 1 },
    { id: "8", text: "That makes sense.", translation: "なるほど。", category: "response", level: 1 },
    { id: "9", text: "I appreciate it.", translation: "感謝します。", category: "thanks", level: 1 },
    { id: "10", text: "No worries at all.", translation: "全然大丈夫だよ。", category: "response", level: 1 },

    // Level 2 - Medium
    { id: "11", text: "I was wondering if you could help me.", translation: "手伝ってもらえないかと思って。", category: "request", level: 2 },
    { id: "12", text: "Would you mind waiting a moment?", translation: "ちょっと待っていただけますか？", category: "request", level: 2 },
    { id: "13", text: "I'm looking forward to seeing you.", translation: "会えるのを楽しみにしています。", category: "greeting", level: 2 },
    { id: "14", text: "It's been a while since we last met.", translation: "最後に会ってからしばらく経つね。", category: "greeting", level: 2 },
    { id: "15", text: "I couldn't agree with you more.", translation: "まったくその通りです。", category: "agreement", level: 2 },
    { id: "16", text: "That's exactly what I was thinking.", translation: "まさにそう思っていました。", category: "agreement", level: 2 },
    { id: "17", text: "Let's grab a coffee sometime.", translation: "今度コーヒーでも飲もう。", category: "invitation", level: 2 },
    { id: "18", text: "I'll get back to you on that.", translation: "その件については後で連絡します。", category: "business", level: 2 },
    { id: "19", text: "Sorry, I didn't catch your name.", translation: "すみません、お名前聞き取れませんでした。", category: "request", level: 2 },
    { id: "20", text: "Do you happen to know the way?", translation: "道をご存知ですか？", category: "question", level: 2 },

    // Level 3 - Advanced
    { id: "21", text: "I really appreciate you taking the time to meet with me.", translation: "お時間をいただきありがとうございます。", category: "business", level: 3 },
    { id: "22", text: "I hate to bother you, but could I ask a quick question?", translation: "お邪魔して申し訳ないのですが、ちょっと質問してもいいですか？", category: "request", level: 3 },
    { id: "23", text: "That's a really interesting point you've raised.", translation: "とても興味深いポイントを挙げましたね。", category: "discussion", level: 3 },
    { id: "24", text: "I was under the impression that we had already discussed this.", translation: "この件については既に話し合ったと思っていましたが。", category: "business", level: 3 },
    { id: "25", text: "Would it be possible to reschedule our meeting?", translation: "ミーティングの日程を変更していただけますか？", category: "business", level: 3 },
    { id: "26", text: "I'm sorry for the inconvenience this may have caused.", translation: "ご迷惑をおかけして申し訳ありません。", category: "apology", level: 3 },
    { id: "27", text: "Let me know if there's anything I can do to help.", translation: "何か手伝えることがあれば言ってください。", category: "offer", level: 3 },
    { id: "28", text: "I think we're on the same page about this.", translation: "この件については同じ認識だと思います。", category: "business", level: 3 },
    { id: "29", text: "As far as I'm concerned, the project is going well.", translation: "私の見る限り、プロジェクトは順調です。", category: "business", level: 3 },
    { id: "30", text: "I'd rather we didn't discuss this in public.", translation: "これは公の場で話さない方がいいと思います。", category: "caution", level: 3 },
];

interface PracticeRecord {
    phraseId: string;
    attempts: number;
    lastPracticed: number;
    completed: boolean;
    bestScore?: number;
}

interface ShadowingData {
    records: Record<string, PracticeRecord>;
    totalAttempts: number;
    streak: number;
    lastPracticeDate: string;
}

export default function ShadowingWidget() {
    const { addXP, checkAndUnlockBadges } = useGamification();
    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<"select" | "practice" | "stats">("select");
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [currentPhrase, setCurrentPhrase] = useState<ShadowingPhrase | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showTranslation, setShowTranslation] = useState(false);
    const [records, setRecords] = useState<Record<string, PracticeRecord>>({});
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [streak, setStreak] = useState(0);
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [pronunciationResult, setPronunciationResult] = useState<PronunciationResult | null>(null);

    useEffect(() => {
        setMounted(true);
        loadData();
    }, []);

    const loadData = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data: ShadowingData = JSON.parse(saved);
            setRecords(data.records || {});
            setTotalAttempts(data.totalAttempts || 0);

            // Check streak
            const today = new Date().toDateString();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (data.lastPracticeDate === today) {
                setStreak(data.streak || 0);
            } else if (data.lastPracticeDate === yesterday.toDateString()) {
                setStreak(data.streak || 0);
            } else {
                setStreak(0);
            }
        }
    };

    const saveData = (updates: Partial<ShadowingData>) => {
        const current: ShadowingData = {
            records,
            totalAttempts,
            streak,
            lastPracticeDate: new Date().toDateString(),
            ...updates
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    };

    const getPhrasesByLevel = (level: number) => {
        return PHRASES.filter(p => p.level === level);
    };

    const startPractice = (level: number) => {
        setSelectedLevel(level);
        const phrases = getPhrasesByLevel(level);
        setPhraseIndex(0);
        setCurrentPhrase(phrases[0]);
        setMode("practice");
        setShowTranslation(false);
    };

    const speak = (text: string, speed: number = playbackSpeed) => {
        if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            utterance.rate = speed;

            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);

            speechSynthesis.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
            setIsPlaying(false);
        }
    };

    const startRecording = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const windowWithSpeech = window as any;

        if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            alert("お使いのブラウザは音声認識に対応していません");
            return;
        }

        const SpeechRecognition = windowWithSpeech.webkitSpeechRecognition || windowWithSpeech.SpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = () => setIsRecording(false);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            const result = event.results[0][0];
            const transcript = result.transcript;
            const confidence = result.confidence || 0;

            console.log("Recognized:", transcript, "Confidence:", confidence);

            // Calculate pronunciation score
            if (currentPhrase) {
                const score = calculatePronunciationScore(currentPhrase.text, transcript);
                setPronunciationResult({
                    transcript,
                    score,
                    confidence: Math.round(confidence * 100)
                });
                recordAttempt(currentPhrase.id, score);
            }
        };

        recognition.start();
    };

    const recordAttempt = (phraseId: string, score: number) => {
        const record = records[phraseId] || {
            phraseId,
            attempts: 0,
            lastPracticed: Date.now(),
            completed: false,
            bestScore: 0
        };

        record.attempts++;
        record.lastPracticed = Date.now();
        record.bestScore = Math.max(record.bestScore || 0, score);
        // Complete if 3+ attempts with good score (70+)
        if (record.attempts >= 3 && score >= 70) {
            record.completed = true;
        }

        const newRecords = { ...records, [phraseId]: record };
        const newTotal = totalAttempts + 1;

        // Check if it's a new day
        const today = new Date().toDateString();
        const saved = localStorage.getItem(STORAGE_KEY);
        const existing = saved ? JSON.parse(saved) : {};
        const isNewDay = existing.lastPracticeDate !== today;
        const newStreak = isNewDay ? streak + 1 : streak;

        setRecords(newRecords);
        setTotalAttempts(newTotal);
        setStreak(newStreak);
        saveData({ records: newRecords, totalAttempts: newTotal, streak: newStreak });

        // Gamification: Add XP and check badges
        addXP(XP_REWARDS.shadowing_attempt, "shadowing_attempt");
        const wasMastered = !records[phraseId]?.completed && record.completed;
        if (wasMastered) {
            addXP(XP_REWARDS.shadowing_master, "shadowing_master");
        }
        const masteredCount = Object.values(newRecords).filter(r => r.completed).length;
        checkAndUnlockBadges({ shadowingMastered: masteredCount, streak: newStreak });
    };

    const nextPhrase = () => {
        const phrases = getPhrasesByLevel(selectedLevel);
        const nextIndex = (phraseIndex + 1) % phrases.length;
        setPhraseIndex(nextIndex);
        setCurrentPhrase(phrases[nextIndex]);
        setShowTranslation(false);
        setPronunciationResult(null);
    };

    const prevPhrase = () => {
        const phrases = getPhrasesByLevel(selectedLevel);
        const prevIndex = phraseIndex === 0 ? phrases.length - 1 : phraseIndex - 1;
        setPhraseIndex(prevIndex);
        setCurrentPhrase(phrases[prevIndex]);
        setShowTranslation(false);
        setPronunciationResult(null);
    };

    const getCompletedCount = (level: number) => {
        return getPhrasesByLevel(level).filter(p => records[p.id]?.completed).length;
    };

    if (!mounted) return null;

    // Stats mode
    if (mode === "stats") {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span className="flex items-center gap-1"><Trophy size={12} />統計</span>
                    <button onClick={() => setMode("select")} className="text-gray-500 hover:text-white"><X size={14} /></button>
                </div>
                <div className="flex-1 p-2 overflow-auto min-h-0 space-y-2">
                    <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-orange-400">🔥 {streak}</p>
                        <p className="text-[8px] text-gray-500">連続練習日数</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#1a1a1a] rounded-lg p-2 text-center">
                            <p className="text-lg font-bold text-cyan-400">{totalAttempts}</p>
                            <p className="text-[8px] text-gray-500">総練習回数</p>
                        </div>
                        <div className="bg-[#1a1a1a] rounded-lg p-2 text-center">
                            <p className="text-lg font-bold text-green-400">{Object.values(records).filter(r => r.completed).length}</p>
                            <p className="text-[8px] text-gray-500">マスター済み</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        {[1, 2, 3].map(level => (
                            <div key={level} className="flex items-center justify-between bg-[#0a0a0a] rounded p-2">
                                <span className="text-[9px] text-gray-400">Level {level}</span>
                                <span className="text-[9px] text-cyan-400">{getCompletedCount(level)}/{getPhrasesByLevel(level).length}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Practice mode
    if (mode === "practice" && currentPhrase) {
        const phrases = getPhrasesByLevel(selectedLevel);
        const currentRecord = records[currentPhrase.id];

        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                        <Headphones size={12} />
                        Level {selectedLevel}
                    </span>
                    <div className="flex items-center gap-1">
                        <span className="text-[8px] text-gray-500">{phraseIndex + 1}/{phrases.length}</span>
                        <button onClick={() => setMode("select")} className="text-gray-500 hover:text-white"><X size={14} /></button>
                    </div>
                </div>

                <div className="flex-1 p-2 overflow-auto min-h-0 flex flex-col">
                    {/* Phrase Card */}
                    <div className="flex-1 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-3 flex flex-col justify-center items-center mb-2">
                        <p className="text-sm font-medium text-white text-center mb-2">{currentPhrase.text}</p>
                        {showTranslation ? (
                            <p className="text-[10px] text-gray-400 text-center">{currentPhrase.translation}</p>
                        ) : (
                            <button
                                onClick={() => setShowTranslation(true)}
                                className="text-[9px] text-cyan-400 hover:text-cyan-300"
                            >
                                翻訳を見る
                            </button>
                        )}
                        {currentRecord?.completed && (
                            <div className="flex items-center gap-1 mt-2 text-green-400">
                                <CheckCircle2 size={12} />
                                <span className="text-[8px]">マスター済み</span>
                            </div>
                        )}
                    </div>

                    {/* Speed Control */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-[8px] text-gray-500">速度:</span>
                        {[0.6, 0.8, 1.0].map(speed => (
                            <button
                                key={speed}
                                onClick={() => setPlaybackSpeed(speed)}
                                className={`px-2 py-0.5 text-[8px] rounded ${playbackSpeed === speed ? "bg-cyan-600 text-white" : "bg-[#2a2a2a] text-gray-400"}`}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <button onClick={prevPhrase} className="p-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg">
                            <ChevronLeft size={16} className="text-gray-400" />
                        </button>
                        <button
                            onClick={() => isPlaying ? stopSpeaking() : speak(currentPhrase.text)}
                            className="p-3 bg-cyan-600 hover:bg-cyan-500 rounded-full"
                        >
                            {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
                        </button>
                        <button
                            onClick={startRecording}
                            disabled={isRecording}
                            className={`p-3 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-green-600 hover:bg-green-500"}`}
                        >
                            <Mic size={20} className="text-white" />
                        </button>
                        <button onClick={nextPhrase} className="p-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg">
                            <ChevronRight size={16} className="text-gray-400" />
                        </button>
                    </div>

                    <p className="text-[8px] text-gray-500 text-center">
                        {isRecording ? "🎤 聞いています..." : "1. 🔊を聞く → 2. 🎤で真似する"}
                    </p>

                    {/* Pronunciation Result */}
                    {pronunciationResult && (
                        <div className="mt-2 bg-[#1a1a1a] rounded-lg p-2 border border-[#2a2a2a]">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[8px] text-gray-500">発音スコア</span>
                                <button
                                    onClick={() => setPronunciationResult(null)}
                                    className="text-gray-500 hover:text-white"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 h-2 bg-[#333] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${pronunciationResult.score >= 90 ? "bg-green-500" :
                                            pronunciationResult.score >= 70 ? "bg-cyan-500" :
                                                pronunciationResult.score >= 50 ? "bg-yellow-500" : "bg-red-500"
                                            }`}
                                        style={{ width: `${pronunciationResult.score}%` }}
                                    />
                                </div>
                                <span className={`text-sm font-bold ${pronunciationResult.score >= 90 ? "text-green-400" :
                                    pronunciationResult.score >= 70 ? "text-cyan-400" :
                                        pronunciationResult.score >= 50 ? "text-yellow-400" : "text-red-400"
                                    }`}>
                                    {pronunciationResult.score}%
                                </span>
                            </div>
                            <p className={`text-[9px] text-center ${getScoreFeedback(pronunciationResult.score).color}`}>
                                {getScoreFeedback(pronunciationResult.score).emoji} {getScoreFeedback(pronunciationResult.score).message}
                            </p>
                            <p className="text-[8px] text-gray-500 text-center mt-1 truncate">
                                認識: &quot;{pronunciationResult.transcript}&quot;
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Select mode (default)
    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0 flex items-center justify-between">
                <span className="flex items-center gap-1">
                    <Headphones size={12} />
                    SHADOWING
                </span>
                <div className="flex items-center gap-1">
                    {streak > 0 && <span className="text-[9px] text-orange-400">🔥{streak}</span>}
                    <button onClick={() => setMode("stats")} className="text-gray-500 hover:text-white" title="統計">
                        <Trophy size={12} />
                    </button>
                </div>
            </div>
            <div className="flex-1 p-2 overflow-auto min-h-0">
                <p className="text-[9px] text-gray-500 mb-2 text-center">レベルを選んでね</p>
                <div className="space-y-2">
                    {[1, 2, 3].map(level => {
                        const phrases = getPhrasesByLevel(level);
                        const completed = getCompletedCount(level);
                        const levelNames = ["初級 - 短文", "中級 - 日常会話", "上級 - ビジネス"];

                        return (
                            <button
                                key={level}
                                onClick={() => startPractice(level)}
                                className="w-full p-3 bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] hover:border-cyan-500/50 rounded-lg transition-all text-left"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-[11px] font-medium text-gray-300">Level {level}</p>
                                    <span className="text-[8px] text-cyan-400">{completed}/{phrases.length}</span>
                                </div>
                                <p className="text-[8px] text-gray-500">{levelNames[level - 1]}</p>
                                <div className="mt-1.5 h-1 bg-[#333] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-green-500"
                                        style={{ width: `${(completed / phrases.length) * 100}%` }}
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
