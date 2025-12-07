"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, RefreshCw, ChevronDown, Mic, Volume2, X, Settings } from "lucide-react";
import { useAISettings } from "@/contexts/AISettingsContext";
import { useGamification, XP_REWARDS } from "@/contexts/GamificationContext";

const STORAGE_KEY = "dashboard-conversation-v1";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ConversationData {
    history: Message[];
    currentScenario: string;
    totalSessions: number;
}

const SCENARIOS = [
    {
        id: "restaurant",
        name: "🍽️ レストラン",
        nameEn: "Restaurant",
        prompt: "You are a waiter/waitress at a casual restaurant. Greet the customer warmly and help them order food and drinks. Use natural, casual English. Keep responses short (1-2 sentences). Start by greeting and asking what they'd like.",
        starter: "Hi there! Welcome to our restaurant. Can I get you started with something to drink?"
    },
    {
        id: "shopping",
        name: "🛍️ ショッピング",
        nameEn: "Shopping",
        prompt: "You are a helpful shop assistant at a clothing store. Help the customer find clothes, suggest sizes, and answer questions. Use natural English. Keep responses short (1-2 sentences).",
        starter: "Hello! Welcome to our store. Are you looking for anything in particular today?"
    },
    {
        id: "hotel",
        name: "🏨 ホテル",
        nameEn: "Hotel",
        prompt: "You are a hotel receptionist. Help the guest check in, answer questions about facilities, and provide helpful information. Use polite but natural English. Keep responses short.",
        starter: "Good day! Welcome to our hotel. Do you have a reservation with us?"
    },
    {
        id: "interview",
        name: "💼 面接練習",
        nameEn: "Job Interview",
        prompt: "You are an interviewer conducting a casual job interview. Ask common interview questions one at a time, respond naturally to answers, and keep the conversation flowing. Be encouraging. Keep responses short.",
        starter: "Thanks for coming in today! Please have a seat. So, tell me a little about yourself."
    },
    {
        id: "travel",
        name: "✈️ 空港・旅行",
        nameEn: "Airport/Travel",
        prompt: "You are an airport staff member or fellow traveler. Help with directions, check-in procedures, or casual travel chat. Use clear, helpful English. Keep responses short.",
        starter: "Hi! You look a bit lost. Do you need help finding something?"
    },
    {
        id: "cafe",
        name: "☕ カフェ",
        nameEn: "Cafe",
        prompt: "You are a barista at a cozy coffee shop. Take orders, recommend drinks, and make small talk. Use friendly, casual English. Keep responses short.",
        starter: "Hey! What can I get for you today? Our special today is a caramel macchiato!"
    },
    {
        id: "doctor",
        name: "🏥 病院",
        nameEn: "Doctor's Office",
        prompt: "You are a doctor or nurse at a clinic. Ask about symptoms, give simple advice, and be reassuring. Use clear, understandable English. Keep responses short.",
        starter: "Hello, I'm Dr. Smith. What brings you in today? What symptoms are you experiencing?"
    },
    {
        id: "smalltalk",
        name: "💬 雑談",
        nameEn: "Small Talk",
        prompt: "You are a friendly person making casual conversation. Talk about weather, hobbies, weekend plans, etc. Use natural, casual English with common expressions. Keep responses short.",
        starter: "Hey! Nice weather we're having, isn't it? Got any fun plans for today?"
    }
];

export default function ConversationWidget() {
    const { settings: aiSettings } = useAISettings();
    const { addXP, checkAndUnlockBadges } = useGamification();
    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<"select" | "chat" | "settings">("select");
    const [currentScenario, setCurrentScenario] = useState<typeof SCENARIOS[0] | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [totalSessions, setTotalSessions] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        loadData();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadData = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data: ConversationData = JSON.parse(saved);
            setTotalSessions(data.totalSessions || 0);
        }
    };

    const saveData = (updates: Partial<ConversationData>) => {
        const current: ConversationData = {
            history: messages,
            currentScenario: currentScenario?.id || "",
            totalSessions,
            ...updates
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    };

    const startScenario = async (scenario: typeof SCENARIOS[0]) => {
        setCurrentScenario(scenario);
        setMessages([{ role: "assistant", content: scenario.starter }]);
        setMode("chat");
        setTotalSessions(prev => prev + 1);
        saveData({ totalSessions: totalSessions + 1, history: [{ role: "assistant", content: scenario.starter }] });

        // Gamification: Add XP for starting a session
        addXP(XP_REWARDS.conversation_session, "conversation_session");
        checkAndUnlockBadges({ conversationCount: totalSessions + 1 });
    };

    const sendMessage = async () => {
        if (!input.trim() || !currentScenario || loading) return;

        const userMessage: Message = { role: "user", content: input.trim() };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setLoading(true);

        try {
            // Add system instruction to message
            const systemPrompt = currentScenario.prompt + "\n\nIMPORTANT: Respond naturally as your character. Keep responses SHORT (1-2 sentences). Use casual, everyday English. If the user makes a grammar mistake, gently correct it naturally within your response.";

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `[System: ${systemPrompt}]\n\nUser: ${input.trim()}`,
                    history: updatedMessages.slice(-8).map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    provider: aiSettings.provider,
                    model: aiSettings.groqModel,
                })
            });

            const data = await res.json();
            if (data.response) {
                const assistantMessage: Message = { role: "assistant", content: data.response };
                const newMessages = [...updatedMessages, assistantMessage];
                setMessages(newMessages);
                saveData({ history: newMessages });

                // Gamification: Add XP for each message
                addXP(XP_REWARDS.conversation_message, "conversation_message");
            }
        } catch (error) {
            console.error(error);
            setMessages([...updatedMessages, { role: "assistant", content: "Sorry, I couldn't understand. Could you say that again?" }]);
        }
        setLoading(false);
    };

    const speak = (text: string) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
        }
    };

    const startVoiceInput = () => {
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

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };

        recognition.start();
    };

    const resetConversation = () => {
        setMessages([]);
        setCurrentScenario(null);
        setMode("select");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!mounted) return null;

    // Scenario selection
    if (mode === "select") {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                        <MessageCircle size={12} />
                        CONVERSATION
                    </span>
                    <span className="text-[8px] text-gray-500">{totalSessions}回練習</span>
                </div>
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    <p className="text-[9px] text-gray-500 mb-2 text-center">シチュエーションを選んでね</p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {SCENARIOS.map(scenario => (
                            <button
                                key={scenario.id}
                                onClick={() => startScenario(scenario)}
                                className="p-2 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] hover:border-cyan-500/50 rounded-lg transition-all hover:scale-[1.02] text-left"
                            >
                                <p className="text-[10px] font-medium text-gray-300">{scenario.name}</p>
                                <p className="text-[8px] text-gray-500">{scenario.nameEn}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Chat mode
    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px]">
                    <MessageCircle size={12} />
                    {currentScenario?.name}
                </span>
                <button onClick={resetConversation} className="text-gray-500 hover:text-white" title="終了">
                    <X size={14} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-2 overflow-auto min-h-0 space-y-2">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] p-2 rounded-lg ${msg.role === "user"
                                ? "bg-cyan-600/80 text-white"
                                : "bg-[#2a2a2a] text-gray-300"
                                }`}
                        >
                            <p className="text-[10px] whitespace-pre-wrap">{msg.content}</p>
                            {msg.role === "assistant" && (
                                <button
                                    onClick={() => speak(msg.content)}
                                    className="mt-1 text-gray-400 hover:text-white"
                                >
                                    <Volume2 size={10} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-[#2a2a2a] p-2 rounded-lg">
                            <p className="text-[10px] text-gray-400">typing...</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 p-2 border-t border-[#2a2a2a]">
                <div className="flex gap-1">
                    <button
                        onClick={startVoiceInput}
                        disabled={loading}
                        className={`p-2 rounded-lg transition-colors ${isListening
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-[#2a2a2a] text-gray-400 hover:text-white"
                            }`}
                        title="音声入力"
                    >
                        <Mic size={14} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your response..."
                        className="flex-1 px-2 py-1.5 text-[10px] bg-[#0a0a0a] border border-[#3a3a3a] rounded-lg focus:border-cyan-500 focus:outline-none"
                        disabled={loading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 rounded-lg transition-colors"
                    >
                        <Send size={14} className="text-white" />
                    </button>
                </div>
                <p className="text-[8px] text-gray-500 mt-1 text-center">
                    {isListening ? "🎤 Listening..." : "Tip: 音声ボタンで話して練習！"}
                </p>
            </div>
        </div>
    );
}
